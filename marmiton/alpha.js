var express = require('express');
const apiRouter = express.Router();
const axios = require('axios').default;
//const got = require('got');
//fs = require('fs');
var convert = require('xml-js');
//var app = express();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var myGenericMongoClient = require('./my_generic_mongo_client');
const { response } = require('express');

const optionDate = { year: "numeric", month: "2-digit", day: "2-digit" }

// Replace mongoId by PMID
function replace_mongoId_byPmid(article) {
    if (article != null) {
        article._id = article.pmid;
        delete article._id;
    }
    return article;
}


// Replace mongoId by PMID in ArrayList
function replace_mongoId_byPmid_inArray(publicationArray) {
    for (i in publicationArray) {
        replace_mongoId_byPmid(publicationArray[i]);
    }
    return publicationArray;
}

// Find article with publication date after a specific date
function findArticlesWithDateMini(articles, dateMini) {
    var selArticles = [];
    for (i in articles) {
        if (articles[i].revisionDate >= dateMini) {
            selArticles.push(articles[i]);
        }
    }
    console.log("number of articles: " + selArticles.length + " published /revised after " + dateMini)
    return selArticles;
}

// Find article with pmid
// function findArticlesWithPmid(articles, pmidSearch) {
//     var selArticles = [];
//     for (i in articles) {
//         if (articles[i].pmid = pmidSearch) {
//             selArticles.push(articles[i]);
//         }
//     }
//     console.log("number of articles: " + selArticles.length + " with pmid " + pmidSearch)
//     return selArticles;
// }

//Get all articles / Get all articles published / revised after a date
//exemple URL: http://localhost:9999/article-api/public/articles (returning all articles)
//             http://localhost:9999/article-api/public/articles?dateMini=2020-06-19
apiRouter.route('/article-api/public/articles')
    .get(function (req, res, next) {
        var dateMini = req.query.dateMini;
        myGenericMongoClient.genericFindList('articles', {}, function (err, allArticle) {
            if (dateMini) {
                res.send(replace_mongoId_byPmid_inArray(findArticlesWithDateMini(allArticle, dateMini)));
            } else {
                res.send(replace_mongoId_byPmid_inArray(allArticle));
                console.log("number of articles in database: " + allArticle.length)
            }
            if (err)
                res.send(err)
        });
    });

// Get article by pmid
//exemple URL: http://localhost:9999/article-api/public/article/pmid/19909739
apiRouter.route('/article-api/public/article/pmid/:pmid')
    .get(function (req, res, next) {
        var articlePmid = req.params.pmid;
        myGenericMongoClient.genericFindOne('articles',
            { 'pmid': articlePmid },
            function (err, article) {
                if (err)
                    res.send(err)
                if (article) {
                    res.send(replace_mongoId_byPmid(article));
                    console.log("Article wit PMID: " + articlePmid + " is found")
                } else {
                    console.log("No article found with the PMID: " + articlePmid)
                }
            });
    });

// Get article with a required word in title
//exemple URL: http://localhost:9999/article-api/public/articles/title/USP25
apiRouter.route('/article-api/public/articles/title/:wordTitle')
    .get(function (req, res, next) {
        var titleSearch = req.params.wordTitle;
        var titleSearchFormatted = titleSearch.replace(/[+]/g, "|")
        myGenericMongoClient.genericFindList('articles',
            { 'articleTitle': { $regex: titleSearchFormatted, $options: 'i' } },
            function (err, articlesListTitle) {
                if (err)
                    res.send(err)
                res.send(replace_mongoId_byPmid(articlesListTitle));
                console.log("number of article(s) with word(s) \"" + titleSearchFormatted.replace(/[|]/g, ", ") + "\" in title: " + articlesListTitle.length)
            });
    });

// Get article by journal
//exemple URL: http://localhost:9999/article-api/public/articles/journal/Molecular+cell
apiRouter.route('/article-api/public/articles/journal/:journal')
    .get(function (req, res, next) {
        var journalSearch = req.params.journal;
        var journalSearchFormatted = journalSearch.replace(/[+]/g, " ")
        console.log("journal: " + journalSearchFormatted)
        myGenericMongoClient.genericFindList('articles',
            { 'journal': journalSearchFormatted },
            function (err, articlesListJournal) {
                if (err)
                    res.send(err)
                res.send(replace_mongoId_byPmid(articlesListJournal));
                console.log("number of articles in " + journalSearchFormatted + " journal: " + articlesListJournal.length)
            });
    });


// Get article with required words in abstract
//exemple URL: http://localhost:9999/article-api/public/articles/abstract/usp28+USP25
apiRouter.route('/article-api/public/articles/abstract/:wordAbstract')
    .get(function (req, res, next) {
        var wordsSearch = req.params.wordAbstract;
        var abstractSearchFormatted = wordsSearch.replace(/[+]/g, "|")
        console.log(abstractSearchFormatted)
        myGenericMongoClient.genericFindList('articles',
            { 'articleAbstract': { $regex: abstractSearchFormatted, $options: 'i' } },
            function (err, articlesListAbstract) {
                if (err)
                    res.send(err)
                res.send(replace_mongoId_byPmid(articlesListAbstract));
                console.log("number of articles with this search \"" + abstractSearchFormatted.replace(/[|]/g, ", ") + "\" in abstract: " + articlesListAbstract.length)
            });
    });

// Get articles with required words in keywords
//exemple URL: http://localhost:9999/article-api/public/articles/keywords/ubiquitin+specific+protease
apiRouter.route('/article-api/public/articles/keywords/:keyword')
    .get(function (req, res, next) {
        var keywordsSearch = req.params.keyword;
        var keywordsSearchFormatted = keywordsSearch.replace(/[+]/g, " ")
        console.log(keywordsSearchFormatted)
        myGenericMongoClient.genericFindList('articles',
            { 'keywordsList': { $regex: keywordsSearchFormatted } },
            function (err, articlesListKeywords) {
                if (err)
                    res.send(err)
                res.send(replace_mongoId_byPmid(articlesListKeywords));
                console.log("number of articles with this search \"" + keywordsSearchFormatted + "\" in keywords: " + articlesListKeywords.length)
            });
    });


//Get articles with a author lastname +/- forename
//exemple URL: http://localhost:9999/article-api/public/articles/author/cholay
//             http://localhost:9999/article-api/public/articles/author/cholay?forename=michael
apiRouter.route('/article-api/public/articles/author/:lastName')
    .get(function (req, res, next) {
        var lastName = req.params.lastName
        var foreName = req.query.foreName;
        if (foreName != undefined) {
            var authorQuery = { $and: [{ 'authorsList.lastName': { $regex: lastName, $options: 'i' } }, { 'authorsList.foreName': { $regex: foreName, $options: 'i' } }] }
        } else {
            var authorQuery = { 'authorsList.lastName': { $regex: lastName, $options: 'i' } }
        }
        myGenericMongoClient.genericFindList('articles',
            authorQuery,
            function (err, articlesListAuthor) {
                if (err)
                    res.send(err)
                res.send(replace_mongoId_byPmid_inArray(articlesListAuthor));
                if (foreName != undefined)
                    console.log("number of articles of this author \"" + lastName + " " + foreName + "\": " + articlesListAuthor.length)
                else console.log("number of articles of this author \"" + lastName + "\": " + articlesListAuthor.length)
            })
    });

// exemple URL: http://localhost:9999/article-api/public/geoloc (returning all geoloc)
//             http://localhost:9999/article-api/public/articles?dateMini=2010-01-01
apiRouter.route('/article-api/public/geoloc')
    .get(function (req, res, next) {
        var dateMini = req.query.dateMini;
        myGenericMongoClient.genericFindList('geoloc', {}, function (err, allGeoloc) {
            if (dateMini) {
                res.send(replace_mongoId_byPmid_inArray(findArticlesWithDateMini(allGeoloc, dateMini)));
            } else {
                res.send(replace_mongoId_byPmid_inArray(allGeoloc));
            }
        });
    });

// Get articles in a specific country (Doesn't work)
//exemple URL: http://localhost:9999/article-api/public/articles/country/France
// apiRouter.route('/article-api/public/articles/country/:affiliationPubmed')
//     .get(function (req, res, next) {
//         var countrySearch = req.params.countrySearch;
//         myGenericMongoClient.genericFindList('articles',
//             { 'authorsList.affiliationList.affiliationPubmed': { $regex: countrySearch, $options: 'i'  } },
//             function (err, articlesListCountry) {
//                 res.send(replace_mongoId_byPmid(articlesListCountry));
//                 console.log("number of articles in the country \"" + countrySearch + "\": " /*+ articlesListCountry.length*/)
//             });
//     });


// Get pmid list for articles with search of pubmed-api each day
function find_Pmid_bySearch_with_terms(/*term*/) {
    var urlApiSearch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&usehistory=y&reldate=5&term=Cell[ta]'/* + term*/
    let request = new XMLHttpRequest()
    request.open("GET", urlApiSearch)
    request.send()
    request.onload = function () {
        if (request.status === 200) {
            var responseJs = JSON.parse(request.responseText)
            var count = responseJs.esearchresult.count
            if (count != 0) {
                var querykey = responseJs.esearchresult.querykey
                var webenv = responseJs.esearchresult.webenv
                console.log("idlist: " + responseJs.esearchresult.idlist)
                find_Article_Data_byFtech_with_PMID(querykey, webenv)
            } else {
                console.log("No result for this query")
            }
        }
    }
}

// // Get all data of articles with Pubmed api
// apiRouter.route('/article-api/public/articlePmidFinder/:term')
//     .get(function (req, res, next) {
//         var term = req.params.term
//         find_Pmid_bySearch_with_terms(term)
//     })

// Get all data of articles with Pubmed api each day
apiRouter.route('/article-api/public/articlePmidFinder')
    .get(function (req, res, next) {
        find_Pmid_bySearch_with_terms()
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
            // console.log(JSON.stringify(responseJs))
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

// prettier-ignore
// list of top 20 of journals in  Biochemistry, Genetics and Molecular Biology (based on SCImago Journal Rank indicator )
const journalsList = ['Nature Reviews Molecular Cell Biology',
    'Nature Reviews Genetics',
    'Cell',
    // 'Nature Reviews Cancer',
    // 'Nature Methods',
    // 'Nature Genetics',
    // 'Annual Review of Biochemistry',
    // 'Nature Medicine',
    // 'Nature Biotechnology',
    // 'Cancer Cell',
    // 'Annual Review of Cell and Developmental Biology',
    // 'Nature Catalysis',
    // 'Molecular Cell',
    // 'Annual Review of Plant Biology',
    // 'Cell Metabolism',
    // 'Annual Review of Physiology',
    // 'Physiological Reviews',
    // 'Journal of Clinical Oncology',
    // 'Nature Cell Biology',
    // 'Trends in Cell Biology'
].map(function (v) {
    return v.toLowerCase();
});

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

        if (articlePropertyListArticles.hasOwnProperty("AuthorList")) {
            article.authorsList = []
            var authorsListInput = articlePropertyListArticles.AuthorList.Author
            if (Array.isArray(authorsListInput)) {

                for (let index = 1; index <= authorsListInput.length; index++) {
        
                    var author = new Object()
                    author.lastName = authorsListInput[index - 1].LastName
            
                    var affiliationInfoString = JSON.stringify(authorsListInput[index - 1].AffiliationInfo)
                    var aff = null
                    author.latitude = "a"
                    if (affiliationInfoString == undefined) {
                        author.affiliationPubmed = "No available affiliation"
                    } 
                    else {
                        if (affiliationInfoString.includes("Affiliation")) {
                            var affiliationAdress = affiliationInfoString.split('"Affiliation":"')
                            author.affiliationPubmed = affiliationAdress[1]
                            aff = author.affiliationPubmed
                        }
                        else if (author.affiliationPubmed.includes("Electronic address:")) {
                            var affiliation = (author.affiliationPubmed.split('. Electronic address: '))
                            author.affiliationPubmed = affiliation[0]
                            aff = author.affiliationPubmed
                            if (affiliation[1].slice(-1) === '.') {
                                author.email = affiliation[1].slice(0, affiliation[1].length - 1)
                            } else { author.email = affiliation[1] }
                        }
                        //////////// geocoding \\\\\\\\\\\\\\
                      //  if (aff != undefined) {
                            console.log("aff: " + aff)
                            var affUTF8 = encodeURI(aff)
                            mapsApiKey = 'AIzaSyCmLt2lwBI0uLNbd8V7boG56frwEfS-QuU'
                            var urlGeoCodingAPI = `https://maps.googleapis.com/maps/api/geocode/json?address= ${affUTF8} &key= ${mapsApiKey}`
                            let geocodeRequest = new XMLHttpRequest()
                            geocodeRequest.open("GET", urlGeoCodingAPI)
                            geocodeRequest.send()
                            geocodeRequest.onload = function () {
                                var geocodeResponse = JSON.parse(geocodeRequest.responseText)
                                //console.log("*****" + geocodeResponse)
                                author.latitude = geocodeResponse.results[0].geometry.location.lat
            
                                console.log("========== lat :" + author.latitude)
                                author.longitude = geocodeResponse.results[0].geometry.location.lng
                            }
                        // } else {
                        //     geoloc.latitude = "Not available"
                        //     geoloc.longitude = "Not available"
                        // }
                        console.log("========== lat dehors :" + author.latitude)
            
                    }
                    article.authorsList.push(author)
                    console.log("fin du push ==========================================") }
                    setTimeout(mafonction, 3000); 
                    
                }
            }
        }
        myGenericMongoClient.genericInsertOne('articles',
            article,
            function (err, res) {
                if (err)
                    res.send(err)
                res.send(article);
            });
        console.log("Article with PMID " + article.pmid + " is successfully saved")
        // } else {
        //     console.log("Article with PMID " + publiListInput[i - 1].MedlineCitation.PMID + " is not saved (published in not selected journal)")
        // }
    }



function listAuthor(list, listVide) {
   
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


////////////////////////////////////////FIN///////////////////////////////////////////