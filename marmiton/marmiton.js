//Imports
const puppeteer = require('puppeteer')
const fs = require('fs')
var myGenericMongoClient = require('../my_generic_mongo_client');

var urlPrincpale = 'https://www.marmiton.org/recettes/?page=2'
// 2 - Récupération des URLs de toutes les pages à visiter
const getAllUrl = async /*(*/browser/*, urlPage)*/ => {
    const page = await browser.newPage()
    await page.goto(urlPrincpale)

    await page.waitFor('body')
    const result = await page.evaluate(() =>
        [...document.querySelectorAll('.recipe-card a')].map(link => link.href),
    )
    return result
}

// const getAllUrlRecette = async (browser, url) => {
//     const page = await browser.newPage()
//     await page.goto(url, { waitUntil: 'load', timeout: 0 })
//     await page.waitFor('body')

//     var urlFinal = []

//     const recupLiensCat = await page.evaluate(() =>
//         // {

//         //     let liensCategorie = Array.from(document.querySelectorAll('.recipe-card a')).map(link => link.href)

//         //     return {liensCategorie}
//         // }
//         [...document.querySelectorAll('.recipe-card a')].map(link => link.href), //a modifier sinon ca marchera pas

//     )

//     return recupLiensCat

// }


// async function fusion(tableauDeTableaux) {
//     var allRecettes = []

//     // Pour chaque élément du tableau des recettes
//     tableauDeTableaux.forEach(listeRecettes => {

//         // Pour chaque sous-tableau (qui contient les urls des recettes)
//         listeRecettes.forEach(recette => {

//             // TODO : à supprimer les logs plus tard

//             // On récupère l'url et on l'ajoute au tableau final
//             allRecettes.push(recette)
//         });
//     });
//     //console.log("=== recette : " + allRecettes)
//     return allRecettes
// }



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

        let id = nomRecette + " marmiton"

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
        let portion = document.querySelector('div.recipe-infos__quantity span.recipe-infos__quantity__value')
        if (portion != null) {
            portion = portion.innerText
        }
        let difficulte = document.querySelector('div.recipe-infos__level span')
        if (difficulte != null) {
            difficulte = difficulte.innerText
        }
        let budget = document.querySelector('div.recipe-infos__budget span')
        if (budget != null) {
            budget = budget.innerText
        }
        let tpsPreparation = document.querySelector('div.recipe-infos__timmings__preparation ')
        if (tpsPreparation != null) {
            tpsPreparation = tpsPreparation.innerText
        }
        let tpsCuisson = document.querySelector('div.recipe-infos__timmings__cooking span')
        if (tpsCuisson != null) {
            tpsCuisson = tpsCuisson.innerText
        }

        let tpsTotal = document.querySelector('div.recipe-infos__timmings__total-time ')
        if (tpsTotal != null) {
            tpsTotal = tpsTotal.innerText
        }

        let site = "marmiton.org"

        let typeRecette = "Dessert"

        let vegieOUpas = null

        return {
            nomRecette, id, difficulte, budget, tpsPreparation, tpsCuisson, tpsTotal, portion,
            imageRecette, ingredients, materiels, etapesPreparation, conseil, typeRecette, source, site, vegieOUpas
        }
    })
}


// 4 - Fonction principale : instanciation d'un navigateur et renvoi des résultats
const scrap = async () => {
    const browser = await puppeteer.launch({ headless: false })

    // var urlData = null
    // for (let i = 1; i < 5; i++) {


    const urlList = await getAllUrl(browser/*, urlPrincpale*/)

    urlData = await Promise.all(
        urlList.map(url => getDataFromUrl(browser, url)), // lien de 30 recette / 5 categorie
    )

    browser.close()
    //attributes_for_one_article(urlData)

return urlData
}


// const traiterDataScrapees = async (results) => {
//     const browser = await puppeteer.launch({ headless: false })

//     var values = fusion(results)

//     // const urlData = await Promise.all(
//     //     values.map(url => getDataFromUrl(browser, url)), // lien de 30 recette / 5 categorie
//     // )


//     browser.close()
//     return results
// }


// function lancerScraping(){
// scrap()
//     .then(value => {
//         traiterDataScrapees(value)

//       })

//       .catch(e => console.log(`error: ${e}`))


// }

function attributes_for_one_article(responseJs) {

    for (let i = 1; i < responseJs.length; i++) {
        const element = responseJs[i - 1];

        var recette = new Object()

        recette.id = element.id
        recette.nomRecette = element.nomRecette
        recette.difficulte = element.difficulte
        recette.budget = element.budget
        recette.tpsPreparation = element.tpsPreparation
        recette.tpsCuisson = element.tpsCuisson
        recette.tempsTotal = element.tempsTotal
        recette.nomRecette = element.nomRecette
        recette.etapesPreparation = element.etapesPreparation
        recette.materiels = element.materiels
        recette.conseil = element.conseil
        recette.ingredients = element.ingredients
        recette.typeRecette = element.typeRecette
        recette.source = element.source
        recette.site = element.site
        recette.vegieOUpas = element.vegieOUpas
        recette.imageRecette = element.imageRecette
        // recette.note = element.note


        myGenericMongoClient.genericInsertOne('devises',
            recette,
            function (err, res) {
                res.send(recette);
            });
        console.log("recette with ID " + recette.nomRecette + " is successfully saved")

    }



}

// 5 - Appel la fonction `scrap()`, affichage les résulats et catch les erreurs
//lancerScraping()

scrap()
    .then(value => {
        console.log(value)
    })

    .catch(e => console.log(`error: ${e}`))



