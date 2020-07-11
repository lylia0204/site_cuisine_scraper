//Imports
const puppeteer = require('puppeteer')
const fs = require('fs')
var myGenericMongoClient = require('../../my_generic_mongo_client');

var urlPrincpale = 'https://www.750g.com/categorie_petit-dejeuner.htm?page=5'
// 2 - Récupération des URLs de toutes les pages à visiter
const getAllUrl = async browser => {
    const page = await browser.newPage()
    await page.goto(urlPrincpale)

    await page.waitFor('body')
    const result = await page.evaluate(() =>
        [...document.querySelectorAll('div.c-row__body a')].map(link => link.href),
    )
    return result
}

//3 - Récupération des elements d'une recette à partir d'une url 

const getDataFromUrl = async (browser, url) => {

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'load', timeout: 0 })
    await page.waitFor('body')
    return page.evaluate(() => {

        let source = document.URL

        let nomRecette = document.querySelector('span.recipe-title')
        if (nomRecette != null) {
            nomRecette = nomRecette.innerText
        }

        let idAtraiter = nomRecette + " 750g"
        let _id = idAtraiter.replace(/ /gi, '-')

        let imageRecette = document.querySelector('div.recipe-cover img')
        if (imageRecette != null) {
            imageRecette = imageRecette.src
        }
        let ingredients = Array.from(document.querySelectorAll('span.recipe-ingredients-item-label'))
        if (ingredients != null) {
            ingredients = ingredients.map((partner) => partner.innerText.trim())
        }
        let conseil = document.querySelector('div.recipe-advice-text p')
        if (conseil != null) {
            conseil = conseil.innerText
        }else{conseil = "Aucun conseil n'a été proposé pour cette recette."}
        let materiels = Array.from(document.querySelectorAll('span.recipe-equipments-item-label'))
        if (materiels != null) {
            materiels = materiels.map((partner) => partner.innerText.trim())
        }

        let etapesPreparation = Array.from(document.querySelectorAll('div.recipe-steps-text p'))
        if (etapesPreparation != null) {
            etapesPreparation = etapesPreparation.map((partner) => partner.innerText.trim())
        }


        let portion = document.querySelector('span.ingredient-variator-label')
        if (portion != null) {
            portion = portion.innerText
        }else{portion = "Non précisée"}


        let note = document.querySelector('span.rating-grade span.u-semi')
        if (note != null) {
            note = note.innerText+"/5"
        }else {note = "4/5"}


        let difficulte = document.querySelectorAll('ul.recipe-info li')[1]
        if (difficulte != null) {
            difficulte = difficulte.innerText
        }
        let budget = document.querySelectorAll('ul.recipe-info li')[2]
        if (budget != null) {
            budget = budget.innerText
        }

        let tpsPreparation = document.querySelectorAll('div.recipe-steps-info div.recipe-steps-info-item time')[0]
        if (tpsPreparation != null) {
            tpsPreparation = tpsPreparation.innerText
        }

        let tpsTotal = document.querySelectorAll('ul.recipe-info li')[0]
        if (tpsTotal != null) {
            tpsTotal = tpsTotal.innerText
        }

        let tpsCuisson = document.querySelectorAll('div.recipe-steps-info div.recipe-steps-info-item time')[1]
        if (tpsCuisson != null) {
            tpsCuisson = tpsCuisson.innerText
        }else{tpsCuisson = "Sans cuisson"}

        let site = "750g.com"

        let typeRecette = null

        let optionType = "petitDej"

        return {
            _id, nomRecette, imageRecette, note, portion, difficulte, budget, tpsPreparation, tpsCuisson, tpsTotal,
            ingredients, materiels, etapesPreparation, conseil, typeRecette, source, site, optionType
        }
    })
}


// 4 - Fonction principale : instanciation d'un navigateur et renvoi des résultats
const scrap = async () => {
    const browser = await puppeteer.launch({ headless: false })
    const urlList = await getAllUrl(browser)
    urlData = await Promise.all(
        urlList.map(url => getDataFromUrl(browser, url)),
    )
    browser.close()

    let data = JSON.stringify(urlData, null, 2)
    fs.writeFileSync('../json/750gRecettePetitDej5.json', data)
    attributParRecette(urlData)
    return urlData
}


function attributParRecette(urlData) {

    for (let i = 1; i < urlData.length; i++) {
        const element = urlData[i - 1];

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
        //console.log(value)
    })

    .catch(e => console.log(`error: ${e}`))



