// 1 - Import de puppeteer et de fs
const puppeteer = require('puppeteer');
const fs = require('fs');
var myGenericMongoClient = require('../my_generic_mongo_client');


// 2 - Récupération des URLs de toutes les pages à visiter
const getAllUrl = async browser => {

    const page = await browser.newPage()
    await page.goto('https://www.750g.com/categorie_entrees.htm')
    await page.waitFor('body')
    const result = await page.evaluate(() =>
        [...document.querySelectorAll('div.c-row__body a')].map(link => link.href),
    )
    return result
}

const getDataFromUrl = async (browser, url) => {

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'load', timeout: 0 })
    await page.waitFor('body')
    return page.evaluate(() => {

        let source = document.URL

        let nomRecette = document.querySelector('header span.c-article__title')
        if (nomRecette != null) {
            nomRecette = nomRecette.innerText
        }

        let _id = nomRecette + " 750g"

        let difficulte = document.querySelectorAll('ul.c-recipe-summary li')[0]
        if (difficulte != null) {
            difficulte = difficulte.innerText
        }

        let budget = document.querySelectorAll('ul.c-recipe-summary li')[1]
        if (budget != null) {
            budget = budget.innerText
        }
        let tpsPreparation = document.querySelectorAll('ul.c-recipe-summary li')[2]
        if (tpsPreparation != null) {
            tpsPreparation = tpsPreparation.innerText
        }
        let tpsCuisson = document.querySelectorAll('ul.c-recipe-summary li')[3]
        if (tpsCuisson != null) {
            tpsCuisson = tpsCuisson.innerText
        }

        if (tpsCuisson != null) {
            tc = parseInt((document.querySelectorAll('ul.c-recipe-summary li')[3]).innerText)
            tp = parseInt((document.querySelectorAll('ul.c-recipe-summary li')[2]).innerText)
            tpsTotal = tc + tp + " min"
        }
        else { tpsTotal = parseInt((document.querySelectorAll('ul.c-recipe-summary li')[2]).innerText) + " min" }


        let note = document.querySelector('div.c-rating span.c-rating__votes')
        if (note != null) {
            note = note.innerText
        }

        let portion = document.querySelector('span.c-ingredient-variator-label')
        if (portion != null) {
            portion = portion.innerText
        }

        let imageRecette = document.querySelector('div.c-diapo__image img')
        if (imageRecette != null) {
            imageRecette = imageRecette.src
        }


        let ingredients = Array.from(document.querySelectorAll('div.c-recipe-ingredients ul.c-recipe-ingredients__list li'))
        if (ingredients != null) {
            ingredients = ingredients.map((x) => x.innerText.trim())
        }

        let materiels = Array.from(document.getElementsByClassName('u-padding-bottom-5px'))
        if (materiels != null) {
            materiels = materiels.map((x) => x.innerText.trim())
        }

        let etapesPreparation = Array.from(document.querySelectorAll('div.c-recipe-steps__item-content p'))
        if (etapesPreparation != null) {
            etapesPreparation = etapesPreparation.map((x) => x.innerText.trim())
        }
        let conseil = document.querySelector('div.c-alert-box p')
        if (conseil != null) {
            conseil = conseil.innerText
        }

        let typeRecette = "entree" 

        let site = "750g.com"


        let optionType = null

        return {
            _id, nomRecette, imageRecette, note, portion, difficulte, budget, tpsPreparation, tpsCuisson, tpsTotal, 
            ingredients, materiels, etapesPreparation, conseil, typeRecette , source, site, optionType
        }
    })
}

// 4 - Fonction principale : instanciation d'un navigateur et renvoi des résultats
const scrap = async () => {
    const browser = await puppeteer.launch({ headless: false })
    const urlList = await getAllUrl(browser)
    const urlData = await Promise.all(
        urlList.map(url => getDataFromUrl(browser, url)),
    )
   
    browser.close()

    //attributes_for_one_article(urlData)
    return urlData
}
function attributes_for_one_article(responseJs) {

    for (let i = 1; i < responseJs.length; i++) {
        const element = responseJs[i - 1];

        var recette = new Object()

        recette._id = element._id
        recette.nomRecette = element.nomRecette
        recette.imageRecette = element.imageRecette
        recette.note = element.note
        recette.portion = element.portion
        recette.difficulte = element.difficulte
        recette.budget = element.budget
        recette.tpsPreparation = element.tpsPreparation
        recette.tpsCuisson = element.tpsCuisson
        recette.tpsTotal = element.tpsTotal
        recette.ingredients = element.ingredients
        recette.etapesPreparation = element.etapesPreparation
        recette.materiels = element.materiels
        recette.conseil = element.conseil
        recette.typeRecette = element.typeRecette
        recette.source = element.source
        recette.site = element.site
        recette.optionType = element.optionType

        myGenericMongoClient.genericInsertOne('recettes',
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
        console.log(value)
    })
    .catch(e => console.log(`error: ${e}`))