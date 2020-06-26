var express = require('express');
const apiRouter = express.Router();

var myGenericMongoClient = require('./my_generic_mongo_client');

// remplacer le _id de mongodb par id
function replace_mongoId_byid(recette){
	recette.id = recette._id;
	delete recette._id; 
	return recette;
}
// je ne comprend pas a revoir ????????????????
function replace_mongoId_byid_inArray(deviseArray){
	for(i in deviseArray){
		replace_mongoId_byid(deviseArray[i]);
	}
	return deviseArray;
}


// recherche par id = id
//exemple URL: http://localhost:8282/recette-api/public/recette/EUR
apiRouter.route('/recette-api/public/recette/:id')
.get( function(req , res  , next ) {
	var idDevise = req.params.id;
	myGenericMongoClient.genericFindOne('recettes',
										{ '_id' : idDevise },
									    function(err,recette){
										   res.send(replace_mongoId_byid(recette));
									   });
	
});

// recherche avec condition je crois (change minimum dans ce cas)
//exemple URL: http://localhost:8282/recette-api/public/recette (returning all recettes)
//             http://localhost:8282/recette-api/public/recette?changeMini=1.05
apiRouter.route('/recette-api/public/recette')
.get( function(req , res  , next ) {
	var changeMini = Number(req.query.changeMini);
	var mongoQuery = changeMini ? { change: { $gte: changeMini }  } : { } ;
	//console.log("mongoQuery=" + JSON.stringify(mongoQuery));
	myGenericMongoClient.genericFindList('recettes',mongoQuery,function(err,recettes){
		   res.send(replace_mongoId_byid_inArray(recettes));
	});//end of genericFindList()
});


// ajouter une nouvelle recette
// http://localhost:8282/recette-api/private/role-admin/recette en mode post
// avec { "id" : "mxy" , "nom" : "monnaieXy" , "change" : 123 } dans req.body
apiRouter.route('/recette-api/private/role-admin/recette') // a changer
.post( function(req , res  , next ) {
	var nouvelleRecette = req.body;
	console.log("POST,nouvelleRecette="+JSON.stringify(nouvelleRecette));
	nouvelleRecette._id=nouvelleRecette.id; // ===========> a revoir
	myGenericMongoClient.genericInsertOne('recettes',
										nouvelleRecette,
									     function(err,recette){
										     res.send(nouvelleRecette);
									    });
});


// mettre a jour une recette
// http://localhost:8282/recette-api/private/role-admin/recette en mode PUT
// avec { "id" : "USD" , "nom" : "Dollar" , "change" : 1.123 } dans req.body
apiRouter.route('/recette-api/private/role-admin/recette')
.put( function(req , res  , next ) {
	var newValueOfRecetteToUpdate = req.body;
	console.log("PUT,newValueOfRecetteToUpdate="+JSON.stringify(newValueOfRecetteToUpdate));
	myGenericMongoClient.genericUpdateOne('recettes',
	newValueOfRecetteToUpdate.id ,
	{ nom : newValueOfRecetteToUpdate.nom , 
	  change : newValueOfRecetteToUpdate.change} , /////// a mettre tout les attributs d'une recette
	function(err,recette){
			if(err){
				res.status(404).json({ error : "no recette to update with id=" + newValueOfRecetteToUpdate.id });
			}else{
					res.send(newValueOfRecetteToUpdate);
			 }
	});	//end of genericUpdateOne()
});

// supprimer une recette 
// http://localhost:8282/recette-api/private/role-admin/recette/EUR en mode DELETE
apiRouter.route('/recette-api/private/role-admin/recette/:id')
.delete( function(req , res  , next ) {
	var idDevise = req.params.id;
	console.log("DELETE,idDevise="+idDevise);
	myGenericMongoClient.genericRemove('recettes',{ _id : idDevise },
									     function(err,recette){
										     res.send({ deletedDeviseid : idDevise } );
									    });
});
 
exports.apiRouter = apiRouter;