var express = require('express');
const apiRouter = express.Router();
// const got = require('got');
// fs = require('fs');
// var convert = require('xml-js');
// var app = express();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var myGenericMongoClient = require('./my_generic_mongo_client');
//const optionDate = { year: "numeric", month: "2-digit", day: "2-digit" }

// Replace mongoId by PMID
function replace_mongoId_byPmid(article) {
    article._id = article.pmid;
    delete article._id;
    return article;
}


// Replace mongoId by PMID in ArrayList
function replace_mongoId_byPmid_inArray(publicationArray) {
    for (i in publicationArray) {
        replace_mongoId_byPmid(publicationArray[i]);
    }
    return publicationArray;
}

// on peut generaliser cette methode pour les get 
// Find article with publication date after a specific date
function findArticlesWithDateMini(articles, dateMini) {
    var selArticles = [];
    for (i in articles) {
        if (articles[i].revisionDate >= dateMini) {
            selArticles.push(articles[i]);
        }
    }
    return selArticles;
}


//dans notre cas recette/ id ou num de recette
//exemple URL: http://localhost:9999/article-api/public/article/30926242
apiRouter.route('/article-api/public/article/:pmid')
    .get(function (req, res, next) {
        var articlePmid = req.params.pmid;
        myGenericMongoClient.genericFindOne('articles',
            { '_id': articlePmid },
            function (err, article) {
                res.send(replace_mongoId_byPmid(article));
            });
    });

    //dans notre cas recette/ id ou num de recette
//exemple URL: http://localhost:9999/article-api/public/articles (returning all articles)
//             http://localhost:9999/article-api/public/articles?dateMini=2010-01-01
apiRouter.route('/article-api/public/articles')
    .get(function (req, res, next) {
        var dateMini = req.query.dateMini;
        myGenericMongoClient.genericFindList('articles', {}, function (err, allArticle) {
            if (dateMini) {
                res.send(replace_mongoId_byPmid_inArray(findArticlesWithDateMini(allArticle, dateMini)));
            } else {
                res.send(replace_mongoId_byPmid_inArray(allArticle));
            }
        });
    });



/**************************************** PAS BESOIN ***************************************************/
/*******************************************************************************************************/

// Get pmid list for articles with search of pubmed-api
function find_Pmid_bySearch_with_terms(term) {
    var urlApiSearch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&usehistory=y&term=' + term
    let request = new XMLHttpRequest()
    request.open("GET", urlApiSearch)
    request.send()
    request.onload = function () {
        //console.log("requestText :" + request.responseText)
        if (request.status === 200) {
            var responseJs = JSON.parse(request.responseText)
            var count = responseJs.esearchresult.count
            if (count != 0) {
                var querykey = responseJs.esearchresult.querykey
                var webenv = responseJs.esearchresult.webenv
                console.log("querykey: " + querykey)
                console.log("webenv: " + webenv)
                console.log("idlist: " + responseJs.esearchresult.idlist)
                find_Article_Data_byFtech_with_PMID(querykey, webenv)
            } else {
                console.log("No result for this query")
            }
        }
    }
}

// Get all data of articles with Pubmed api
apiRouter.route('/article-api/public/articlePmidFinder/:term')
    .get(function (req, res, next) {
        var term = req.params.term
        find_Pmid_bySearch_with_terms(term)
    })

// Get all data for articles with fetch of pubmed-api and xml conversion
function find_Article_Data_byFtech_with_PMID(querykey, webenv) {
    var urlApiFetch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&query_key=' + querykey + '&WebEnv=' + webenv + '&rettype=abstract&retmode=xml'
    let request = new XMLHttpRequest()
    request.open("GET", urlApiFetch)
    // request.responseType = "document"
    request.send()
    request.onload = () => {
        console.log("requestSatus :" + request.status)
        if (request.status === 200) {
            responseJs = convert.xml2js(request.responseText, options)
            console.log(JSON.stringify(responseJs))
            var publiListInput = responseJs.PubmedArticleSet.PubmedArticle
            //    console.log("publiListInput: " + JSON.stringify(publiListInput, null, " "))
            if (publiListInput.length === undefined) {
                attributes_for_one_article(responseJs)
            } else attributes_for_list_of_articles(publiListInput)

        }
    }
}

// ArticleData when request return only one article
function attributes_for_one_article(responseJs) {
    console.log("***** 1 article found with this request ******")
    var article = new Object()
    var medlineCitationPropertyOneArticle = responseJs.PubmedArticleSet.PubmedArticle.MedlineCitation
    var articlePropertyOneArticle = responseJs.PubmedArticleSet.PubmedArticle.MedlineCitation.Article


    article.pmid = medlineCitationPropertyOneArticle.PMID
    article.articleTitle = articlePropertyOneArticle.ArticleTitle
    article.journal = articlePropertyOneArticle.Journal.Title


    if (medlineCitationPropertyOneArticle.hasOwnProperty("DateCompleted")) {
        date = new Date(Date.UTC(medlineCitationPropertyOneArticle.DateCompleted.Year, medlineCitationPropertyOneArticle.DateCompleted.Month - 1, medlineCitationPropertyOneArticle.DateCompleted.Day))
    } else date = new Date(Date.UTC(articlePropertyOneArticle.ArticleDate.Year, articlePropertyOneArticle.ArticleDate.Month - 1, articlePropertyOneArticle.ArticleDate.Day))
    article.publicationDate = date.toLocaleDateString(undefined, optionDate)

    dateOfRevision = new Date(Date.UTC(medlineCitationPropertyOneArticle.DateRevised.Year, medlineCitationPropertyOneArticle.DateRevised.Month - 1, medlineCitationPropertyOneArticle.DateRevised.Day))
    article.revisionDate = dateOfRevision.toLocaleDateString(undefined, optionDate)

    article.articleAbstract = articlePropertyOneArticle.Abstract.AbstractText
    article.pubmedUrl = "https://pubmed.ncbi.nlm.nih.gov/" + article.pmid

    if (medlineCitationPropertyOneArticle.hasOwnProperty("KeywordList")) {
        article.keywordsList = medlineCitationPropertyOneArticle.KeywordList.Keyword
    } else article.keywordsList = "Not available"
    article.authorsList = []
    //authorsList_data_for_one_article(responseJs)
    console.log("new article: " + JSON.stringify(article, null, " "))
}

// ArticleData when request return a list of articles
function attributes_for_list_of_articles(publiListInput) {
    console.log("***** " + publiListInput.length + " articles found with this request ******")
    //for (i in publiListInput) {

    for (let i = 1; i <= publiListInput.length; i++) {
        var article = new Object()
        var medlineCitationPropertyListArticles = publiListInput[i - 1].MedlineCitation
        var articlePropertyListArticles = publiListInput[i - 1].MedlineCitation.Article

        article.pmid = medlineCitationPropertyListArticles.PMID
        article.articleTitle = articlePropertyListArticles.ArticleTitle
        article.journal = articlePropertyListArticles.Journal.Title

        if (medlineCitationPropertyListArticles.hasOwnProperty("DateCompleted")) {
            date = new Date(Date.UTC(medlineCitationPropertyListArticles.DateCompleted.Year, medlineCitationPropertyListArticles.DateCompleted.Month - 1, medlineCitationPropertyListArticles.DateCompleted.Day))
        } else {
            date = new Date(Date.UTC(articlePropertyListArticles.ArticleDate.Year, articlePropertyListArticles.ArticleDate.Month - 1, articlePropertyListArticles.ArticleDate.Day))
            console.log("no DateCompleted property for " + article.pmid)
        }
        article.publicationDate = date.toLocaleDateString(undefined, optionDate)

        if (medlineCitationPropertyListArticles.hasOwnProperty("DateRevised")) {
            dateOfRevision = new Date(Date.UTC(medlineCitationPropertyListArticles.DateRevised.Year, medlineCitationPropertyListArticles.DateRevised.Month - 1, medlineCitationPropertyListArticles.DateRevised.Day))
        } else {
            dateOfRevision = "No revision date"
            console.log("no DateRevised property for " + article.pmid)
        }
        article.revisionDate = dateOfRevision.toLocaleDateString(undefined, optionDate)

        // var abstractPropertyListArticles = articlePropertyListArticles.Abstract
        if (articlePropertyListArticles.hasOwnProperty("Abstract")) {
            if (Array.isArray(articlePropertyListArticles.Abstract.AbstractText)){
                article.articleAbstract = articlePropertyListArticles.Abstract.AbstractText.join(" ")
            }
            else article.articleAbstract = articlePropertyListArticles.Abstract.AbstractText
            //console.log(Array.isArray(articlePropertyListArticles.Abstract.AbstractText))
        } else {
            article.articleAbstract = "Not available"
            console.log("no AbstractText property for " + article.pmid)
        }

        article.pubmedUrl = "https://pubmed.ncbi.nlm.nih.gov/" + article.pmid

        if (medlineCitationPropertyListArticles.hasOwnProperty("KeywordList")) {
            if (Array.isArray(medlineCitationPropertyListArticles.KeywordList.Keyword)){
                article.keywordsList = medlineCitationPropertyListArticles.KeywordList.Keyword.join(", ")
            }
            else article.keywordsList = medlineCitationPropertyListArticles.KeywordList.Keyword
        } else {
            article.keywordsList = "No keyword"
            console.log("No keyword for " + article.pmid)
        }

        if (articlePropertyListArticles.hasOwnProperty("AuthorList")) {
            article.authorsList = []
            // authorsList_data_for_list_of_articles(publiListInput)
            var authorsListInput = articlePropertyListArticles.AuthorList.Author
            if (authorsListInput[0] != undefined) {
                for (let index = 1; index <= authorsListInput.length; index++) {
                    var author = new Object()
                    author.lastName = authorsListInput[index - 1].LastName
                    author.foreName = authorsListInput[index - 1].ForeName
                    // author.AffiliationInfo = authorsListInput[index - 1].AffiliationInfo
                    var affiliationInfoString = JSON.stringify(authorsListInput[index - 1].AffiliationInfo)
                    //console.log("affiliationInfoString: " + affiliationInfoString)
                    if (affiliationInfoString == undefined) {
                        //console.log("No affiliation")
                        author.affiliation1 = "No affiliation"
                    } else if (affiliationInfoString.includes("Affiliation")) {
                        //var affiliationAndEmail = authorsListInput[index - 1].AffiliationInfo.Affiliation
                        // if (affiliationAndEmail == undefined) {
                        //     return "Not available"
                        // } else if (affiliationInfoString.includes("},{")){
                        var affiliationAdress = affiliationInfoString.split('"Affiliation":"')
                        author.affiliation1 = affiliationAdress[1]
                        if (author.affiliation1 != undefined) {
                            if (author.affiliation1.includes("Electronic address:")) {
                                var affiliation = (author.affiliation1.split('. Electronic address: '))
                                author.affiliation1 = affiliation[0]
                                if (affiliation[1].slice(-1) === '.') {
                                    author.email = affiliation[1].slice(0, affiliation[1].length - 1)
                                } else author.email = affiliation[1]
                            }
                        } else author.affiliation1 = affiliationAdress[1]

                        author.affiliation2 = affiliationAdress[2]
                        if (author.affiliation2 != undefined) {
                            if (author.affiliation2.includes("Electronic address:")) {
                                var affiliation = (author.affiliation2.split('. Electronic address: '))
                                author.affiliation2 = affiliation[0]
                                if (affiliation[1].slice(-1) === '.') {
                                    author.email = affiliation[1].slice(0, affiliation[1].length - 1)
                                } else author.email = affiliation[1]
                            }
                        } else author.affiliation2 = affiliationAdress[2]
                        //console.log("1: " + author.affiliation1 + " 2: " + author.affiliation2)
                    }
                    article.authorsList.push(author)
                }
            } else {
                author.lastName = authorsListInput.LastName
                author.foreName = authorsListInput.ForeName
                article.authorsList.push(author)
            }
        } else {
            article.authorsList = "No author"
            console.log("No author for " + article.pmid)
        }

        console.log()
        console.log("------------------------- ARTICLE " + i + " / " + publiListInput.length + " -------------------------")
        console.log(JSON.stringify(article, null, " "))
        console.log()
        // console.log("***** Find " + article.authorsList.length + " author(s) for this article *****")
        // console.log("author(s): " + JSON.stringify(article.authorsList, null, " "))

        //replace_mongoId_byPmid(article)
        //var publicationsList = [article]
        //replace_mongoId_byPmid_inArray(publicationsList)
        // mongoDbInsert(null, article)
        myGenericMongoClient.genericInsertOne('articles',
            article,
            function (err, res) {
                res.send(article);
            });
        console.log("Article with PMID " + article.pmid + " is successfully saved")

    }
}

// function mongoDbInsert (req, res, next) {
//     var newArticle = res;
//     myGenericMongoClient.genericInsertOne('articles',
//         newArticle,
//         function (err, res) {
//             res.send(newArticle);
//             console.log("Article is successfully saved")
//         });
//     }

// AuthorsData when request return a list of articles
function authorsList_data_for_list_of_articles(publiListInput) {
    var authorsListInput = publiListInput[i].MedlineCitation.Article.AuthorList.Author
    for (index in authorsListInput) {
        var author = new Object()
        author.lastName = authorsListInput[index].LastName
        author.foreName = authorsListInput[index].ForeName

        // article.authorsList = []
        authorsList.push(author)
    }

    // console.log("***** Find " + authorsList.length + " authors for this article *****")
    // console.log("authors: " + JSON.stringify(authorsList, null, " "))
}


// AuthorsData when request return only one article
function AuthorsList_data_for_one_article(responseJs) {
    var authorsListInput = responseJs.PubmedArticleSet.PubmedArticle.MedlineCitation.Article.AuthorList
    for (i in authorsListInput) {
        var author = new Object()
        author.lastName = authorsListInput[i].LastName
        author.foreName = authorsListInput[i].ForeName
        console.log(author)
        // authorsList.push(author)
    }
    // return authorsList
}


// Conversion of xml results to Js object
const removeJsonTextAttribute = function (value, parentElement) {
    try {
        const parentOfParent = parentElement._parent;
        const pOpKeys = Object.keys(parentElement._parent);
        const keyNo = pOpKeys.length;
        const keyName = pOpKeys[keyNo - 1];
        const arrOfKey = parentElement._parent[keyName];
        const arrOfKeyLen = arrOfKey.length;
        if (arrOfKeyLen > 0) {
            const arr = arrOfKey;
            const arrIndex = arrOfKey.length - 1;
            arr[arrIndex] = value;
        } else {
            parentElement._parent[keyName] = value;
        }
    } catch (e) { }
};

var options = {
    compact: true,
    spaces: 2,
    trim: true,
    nativeType: false,
    ignoreDeclaration: true,
    ignoreInstruction: true,
    ignoreAttributes: true,
    ignoreComment: true,
    ignoreCdata: true,
    ignoreDoctype: true,
    textFn: removeJsonTextAttribute
};

// function xml_to_Js (responseText, options) {
//     convert.xml2js(responseText, options);
// }


exports.apiRouter = apiRouter;