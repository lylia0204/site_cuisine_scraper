//Imports
const puppeteer = require('puppeteer')
const fs = require('fs')
var myGenericMongoClient = require('../my_generic_mongo_client');

/*
// 2 - Récupération des URLs de toutes les pages à visiter
- waitFor("body"): met le script en pause le temps que la page se charge
- document.querySelectorAll(selector): renvoie tous les noeuds qui vérifient le selecteur
- [...document.querySelectorAll(selector)]: caste les réponses en tableau
- Array.map(link => link.href): récupère les attributs href de tous les liens
*/
const getAllUrlCategorie = async browser => {
    const page = await browser.newPage()
    await page.goto('https://www.marmiton.org/recettes/')
    await page.waitFor('body')
    const result = await page.evaluate(() =>
        [...document.querySelectorAll('div.home-search-recipe-container ul li a')].map(link => link.href), //a modifier sinon ca marchera pas
    )
    return result
}

const getAllUrlRecette = async (browser, url) => {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'load', timeout: 0 })
    await page.waitFor('body')

    var urlFinal = []

    const recupLiensCat = await page.evaluate(() =>
    {

        let liensCategorie = Array.from(document.querySelectorAll('.recipe-card a')).map(link => link.href)

        return {liensCategorie}
    }

    //[...document.querySelectorAll('.recipe-card a')].map(link => link.href), //a modifier sinon ca marchera pas
    

)
   
    return recupLiensCat

}


function retourUrl(url) {
    return recupLiensCat
}

async function methodeAPoffiner(result, urlFinal) {
   
}


 

// const scrap1 = async () => {
//     const browser = await puppeteer.launch({ headless: false })
//     const urlCategorieList = await getAllUrlCategorie(browser)

//     const results = await Promise.all(
//         urlCategorieList.map(url => getAllUrlRecette(browser, url)),
//     )
//     browser.close()
//     return results
// }


//3 - Récupération des elements d'une recette à partir d'une url 

const getDataFromUrl = async (browser, url) => {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'load', timeout: 0 })
    await page.waitFor('body')
    return page.evaluate(() => {

        
        
        
        let nomRecette = document.querySelector('h1')
        if (nomRecette != null) {
            nomRecette = nomRecette.innerText
        }
        
        let id = nomRecette + "marmiton"

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
        // let tpsRepos = 
        // if (tpsRepos != null) {
        //     tpsRepos = tpsRepos.innerText
        // }
        let tpstotal = document.querySelector('div.recipe-infos__timmings__total-time ')
        if (tpstotal != null) {
            tpstotal = tpstotal.innerText
        }
        // let nbrKcal = 
        // if (nbrKcal != null) {
        //     nbrKcal = nbrKcal.innerText
        // }
        // let video = document.querySelectorAll('div.af-videoplayer video.vjs-tech source ').src
        // if (video != null) {
        //     video = video.innerText
        // }

        let spliteUr = "spliter url a = " // et recuperer que la categorie

        let typeRecette = "Dessert"       // qu'on stock ici

        let source = "marmiton.org" / url

        let vegieOUpas = null


        return {
            nomRecette, imageRecette, ingredients, materiels,
            etapesPreparation, conseil, portion, difficulte, budget, tpsCuisson, tpsPreparation, tpstotal, typeRecette
        }
    })
}


// 4 - Fonction principale : instanciation d'un navigateur et renvoi des résultats
/*
- urlList.map(url => getDataFromUrl(browser, url)):
appelle la fonction getDataFromUrl sur chaque URL de `urlList` et renvoi un tableau

- await Promise.all(promesse1, promesse2, promesse3):
bloque de programme tant que toutes les promesses ne sont pas résolues
*/
const scrap = async () => {
    const browser = await puppeteer.launch({ headless: false })

    const urlCategorieList = await getAllUrlCategorie(browser) //liens categorie (plat , dessert , entree) 

   
    const urlRecetteList = await Promise.all(
        urlCategorieList.map(url => getAllUrlRecette(browser, url)), // lien de 30 recette * 7 categorie
    )
    // const urlData = await Promise.all(
    //     urlRecetteList.map(url => getDataFromUrl(browser, url)), // lien de 30 recette / 5 categorie
    // )

    browser.close()
    //attributes_for_one_article(results) //a modifier
    return urlRecetteList
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
        console.log(value)
    })
    .catch(e => console.log(`error: ${e}`))