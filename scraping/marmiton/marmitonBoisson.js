//Imports
const puppeteer = require('puppeteer')
const fs = require('fs')
var myGenericMongoClient = require('../my_generic_mongo_client');

var urlPrincpale = 'https://www.marmiton.org/recettes/?type=boisson'
// 2 - Récupération des URLs de toutes les pages à visiter
const getAllUrl = async browser => {
    const page = await browser.newPage()
    await page.goto(urlPrincpale)

    await page.waitFor('body')
    const result = await page.evaluate(() =>
        [...document.querySelectorAll('.recipe-card a')].map(link => link.href),
    )
    return result
}

//3 - Récupération des elements d'une recette à partir d'une url 

const getDataFromUrl = async (browser, url) => {

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'load', timeout:0 })
    await page.waitFor('body')
    return page.evaluate(() => {

        let source = document.URL

        let nomRecette = document.querySelector('h1')
        if (nomRecette != null) {
            nomRecette = nomRecette.innerText
        }

        let idAtraiter = nomRecette + " marmiton"
        let _id = idAtraiter.replace(/ /gi,'-')

        let imageRecette = document.querySelector('div.diapo img')
        if (imageRecette != null) {
            imageRecette = imageRecette.src
        }
        let ingredients = Array.from(document.getElementsByClassName('recipe-ingredients__list__item'))
        if (ingredients != null) {
            ingredients = ingredients.map((partner) => partner.innerText.trim())
        }
        let conseil = document.querySelector('p.mrtn-recipe-bloc__content')
        if (conseil != null) {
            conseil = conseil.innerText
        }
        let materiels = Array.from(document.getElementsByClassName('recipe-utensil__name'))
        if (materiels != null) {
            materiels = materiels.map((partner) => partner.innerText.trim())
        }
        let etapesPreparation = Array.from(document.getElementsByClassName('recipe-preparation__list__item'))
        if (etapesPreparation != null) {
            etapesPreparation = etapesPreparation.map((partner) => partner.innerText.trim())
        }

     

        let valeur = document.querySelector('div.recipe-infos__quantity span.recipe-infos__quantity__value')
        if (valeur != null) {
            valeur = valeur.innerText +" "
        }
        let unite = document.querySelector('div.recipe-infos__quantity span.recipe-infos__item-title')
        if (unite != null) {
            unite = unite.innerText
        }
        let portion = valeur.concat(unite)
       

        let  note = document.querySelector('span.recipe-infos-users__rating')
        if (note != null) {
            note = note.innerText
        }
    

        let difficulte = document.querySelector('div.recipe-infos__level span')
        if (difficulte != null) {
            difficulte = difficulte.innerText
        }
        let budget = document.querySelector('div.recipe-infos__budget span')
        if (budget != null) {
            budget = budget.innerText
        }
        let tpsPreparationPur = document.querySelector('div.recipe-infos__timmings__preparation ')
        if (tpsPreparationPur != null) {
            tpsPreparationPur = tpsPreparation.innerText
        }

        tpsPreparation = tpsPreparationPur.replace(/Préparation :/, '' )
        
        let tpsTotalPur = document.querySelector('div.recipe-infos__timmings__total-time ')
        if (tpsTotalPur != null) {
            tpsTotalPur = tpsTotal.innerText
        }
        
        tpsTotal= tpsTotalPur.replace(/Temps Total :/, '')  
        let tpsCuisson = document.querySelector('div.recipe-infos__timmings__cooking span')
        if (tpsCuisson != null) {
            tpsCuisson = tpsCuisson.innerText
        }

        let site = "marmiton.org"

        let typeRecette = "boisson"

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
    urlData = await Promise.all(
        urlList.map(url => getDataFromUrl(browser, url)), 
    )
    browser.close()

    // let data = JSON.stringify(urlData, null, 2)
    // fs.writeFileSync('../json/marmitonRecetteBoisson.json', data)  
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



