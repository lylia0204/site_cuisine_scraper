var recettesParCategorie =
    [
        [
            'https://www.marmiton.org/recettes/recette_pissaladiere_20407.aspx',
            'https://www.marmiton.org/recettes/recette_tarte-a-l-ail-des-ours_47357.aspx',
            'https://www.marmiton.org/recettes/recette_salade-de-concombre-au-chevre-et-olives_22393.aspx',
            'https://www.marmiton.org/recettes/recette_tzatziki-grece_11797.aspx'
        ],
        [
            'https://www.marmiton.org/recettes/recette_roti-de-porc-a-la-moutarde-et-au-miel_17178.aspx',
            'https://www.marmiton.org/recettes/recette_croque-monsieur_19208.aspx',
            'https://www.marmiton.org/recettes/recette_roti-de-boeuf-au-four-tout-simple_342546.aspx',
            'https://www.marmiton.org/recettes/recette_roti-de-porc-tout-simple_170153.aspx'
        ]
    ]

// Appel de test
fusion(recettesParCategorie)


/*
* Fonctions
*/
async function fusion(tableauDeTableaux) {
    var allRecettes = []

    // Pour chaque élément du tableau des recettes
    tableauDeTableaux.forEach(listeRecettes => {

        // Pour chaque sous-tableau (qui contient les urls des recettes)
        listeRecettes.forEach(recette => {

            // TODO : à supprimer les logs plus tard
            console.log("=================================== recette : " + a)

            // On récupère l'url et on l'ajoute au tableau final
            allRecettes.push(recette)
        });
    });
    return allRecettes
}