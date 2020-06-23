// 1 - Import de puppeteer et de fs
const puppeteer = require('puppeteer');
const fs = require('fs');
var myGenericMongoClient = require('./my_generic_mongo_client');

/*
// 2 - Récupération des URLs de toutes les pages à visiter
- waitFor("body"): met le script en pause le temps que la page se charge
- document.querySelectorAll(selector): renvoie tous les noeuds qui vérifient le selecteur
- [...document.querySelectorAll(selector)]: caste les réponses en tableau
- Array.map(link => link.href): récupère les attributs href de tous les liens
*/
const getAllUrl = async browser => {
    
   // await page.waitFor('body')
   const page = await browser.newPage ()
    //var lastPageNumber = 3
  // for (let index = 0; index < lastPageNumber; index++) {
    // const page = await browser.newPage ()
    // var lastPageNumber = 3
    await page.goto( 'https://www.750g.com/categorie_aperitifs.htm')
  
    //await page.goto('https://www.750g.com/categorie_aperitifs.htm?page=${index}')
    await page.waitFor('body')
    const result = await page.evaluate(() =>
        Array.from(document.querySelectorAll('div.c-row__body a')).map(url => url.href)
    )
    return result
   }

  
    // var results = []
    // for (let index = 0; index < lastPageNumber; index++) {
    //     await page.waitFor('body')
    //     results = results.concat(await getAllUrl())
    // }
    // async function extractedEvaluateCall(page) {
       
    //     await page.goto('https://www.750g.com/categorie_aperitifs.htm')
    //     const results = await page.evaluate(() => {
    //         Array.from(document.querySelectorAll('div.c-row__body a')).map(url => url.href)
    //     })
    //    return results 
    // }
   


// if (result.length < 1) {
//     // Terminate if no partners exist
//     return result
//   } else {
//     // Go fetch the next page ?page=X+1

//     // const nextPageNumber = parseInt(url.match(/page=(\d+)$/)[2], 10) + 1;
//     // const nextUrl = `https://www.750g.com/categorie_aperitifs.htm?page=${nextPageNumber}`;

//     return result.concat(await getAllUrl(nextUrl))
//   }

const getDataFromUrl = async (browser, url) => {

    const page = await browser.newPage()

    await page.goto(url, { waitUntil: 'load', timeout: 0 })

    await page.waitFor('body')

    return page.evaluate(() => {

        let nomRecette = document.querySelector('header span.c-article__title')
        if (nomRecette != null) {
            nomRecette = nomRecette.innerText
        }
        let id = nomRecette + " 750g"

        let difficulte = document.querySelectorAll('ul.c-recipe-summary li')[0]
        if (difficulte != null) {
            difficulte = difficulte.innerText
        }
        let budget = document.querySelectorAll('ul.c-recipe-summary li')[1]
        if (budget != null) {
            budget = budget.innerText
        }
        let tempsprepa = document.querySelectorAll('ul.c-recipe-summary li')[2]
        if (tempsprepa != null) {
            tempsprepa = tempsprepa.innerText
        }
        let tempscuisson = document.querySelectorAll('ul.c-recipe-summary li')[3]
        if (tempscuisson != null) {
            tempscuisson = tempscuisson.innerText
        }

        if (tempscuisson != null) {
            tc = parseInt((document.querySelectorAll('ul.c-recipe-summary li')[3]).innerText)
            tp = parseInt((document.querySelectorAll('ul.c-recipe-summary li')[2]).innerText)
            tempsTotal = tc + tp + " min"
        }
        else { tempsTotal = parseInt((document.querySelectorAll('ul.c-recipe-summary li')[2]).innerText) + " min" }


        let note = document.querySelector('div.c-rating span.c-rating__votes')
        if (note != null) {
            note = note.innerText
        }

        let imageRecette = document.querySelector('div.c-diapo__image img')
        if (imageRecette != null) {
            imageRecette = imageRecette.src
        }


        let ingredients = Array.from(document.getElementsByClassName('c-recipe-ingredients__list'))
        if (ingredients != null) {
            ingredients = ingredients.map((x) => x.innerText.trim())
        }

        let materiels = Array.from(document.getElementsByClassName('u-padding-bottom-5px'))
        if (materiels != null) {
            materiels = materiels.map((x) => x.innerText.trim())
        }

        let preparation = Array.from(document.getElementsByClassName('c-recipe-steps__list'))
        if (preparation != null) {
            preparation = preparation.map((x) => x.innerText.trim())
        }
        let conseil = document.querySelector('div.c-alert-box p')
        if (conseil != null) {
            conseil = conseil.innerText
        }
        let spliteUr = "spliter url a = " // et recuperer que la categorie

        let typeRecette = "Apéritifs"       // qu'on stock ici

        let source = "750g" / url

        let vegieOUpas = null
        return { nomRecette, id, difficulte, budget, tempsprepa, tempscuisson, tempsTotal, note, 
            imageRecette, ingredients, materiels, preparation, conseil, typeRecette , source}


    })
}







/*
// 4 - Fonction principale : instanciation d'un navigateur et renvoi des résultats
- urlList.map(url => getDataFromUrl(browser, url)):
appelle la fonction getDataFromUrl sur chaque URL de `urlList` et renvoi un tableau
 
- await Promise.all(promesse1, promesse2, promesse3):
bloque de programme tant que toutes les promesses ne sont pas résolues
*/
const scrap = async () => {
    const browser = await puppeteer.launch({ headless: false })
    const urlList = await getAllUrl(browser)
    // const firstUrl =
    // "https://www.750g.com/categorie_aperitifs.htm?page=1";

    const page = await browser.newPage()
    results = await Promise.all(
        urlList.map(url => getDataFromUrl(browser, url)))

    browser.close()
    // let data = JSON.stringify(results, null, 2);
    // fs.writeFileSync('./json/recettes.json', data);
    return results
}
function attributes_for_one_article(responseJs) {
    // console.log("***** 1 recette found with this request ******")

    for (let i = 1; i < responseJs.length; i++) {
        const element = responseJs[i - 1];

        var recette = new Object()

        recette.nomRecette = element.nomRecette
        //recette.budget = element.budget


        // si ca existe input
        // sinon insert


        myGenericMongoClient.genericInsertOne('devises',
            recette,
            function (err, res) {
                res.send(recette);
            });
        console.log("recette with ID " + recette.nomRecette + " is successfully saved")

    }



}


// 5 - Appel la fonction `scrap()`, affichage les résulats et catch les erreurs
scrap()
    .then(value => {
        //console.log(value)
        console.log(value.length)
    })
    .catch(e => console.log(`error: ${e}`))