var express = require('express');
const apiRouter = express.Router();
var myGenericMongoClient = require('./my_generic_mongo_client');

var collection = process.env.COLLECTION || COLLECTION;

// remplacer le _id de mongodb par id
function replace_mongoId_byid(recette){
	recette._id = recette._id;
	delete recette._id; 
	return recette;
}
// je ne comprend pas a revoir ????????????????
function replace_mongoId_byid_inArray(recetteArray){
	for(i in recetteArray){
		replace_mongoId_byid(recetteArray[i]);
	}
	return recetteArray;
}

/////////////////////////////////////////////////////// recherche par id = id
//exemple URL: http://localhost:8888/recette-api/public/recette/EUR
apiRouter.route('/recette-api/public/recette/:_id')
.get( function(req , res  , next ) {
	var idRecette = req.params._id;
	myGenericMongoClient.genericFindOne(collection,
										{ '_id' : idRecette },
									    function(err,recette){
										   res.send(recette);
									   });
});
 

///////////////////////////////////////////////////////// GET ALL //////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//exemple URL: http://localhost:8888/recette-api/public/recette (returning all recettes)
//             http://localhost:8888/recette-api/public/recette?cat_=typeRecette
apiRouter.route('/recette-api/public/recettes')
.get( function(req , res  , next ) {
	var cat_ =req.query.cat_;
	
	var mongoQuery = cat_ ? { typeRecette: cat_   } : {};
	myGenericMongoClient.genericFindList(collection,mongoQuery ,function(err,recette){
		   res.send(recette);
	});
});
///////////////////////////////////////////////////////// GET  BY CATEGORIE/////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//exemple URL: http://localhost:8888/recette-api/public/recette (returning all recettes)
//             http://localhost:8888/recette-api/public/recette?cat_=typeRecette
apiRouter.route('/recette-api/public/recette')
.get( function(req , res  , next ) {
	var categorie =req.query.cat_;
	console.log("======cat du node ")
	var mongoQuery = categorie ? { typeRecette: categorie   } : {};
	myGenericMongoClient.genericFindList(collection,mongoQuery ,function(err,recette){
		   res.send(recette);
	});
});

////////////////////////////////////////////////////////// CREATE /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// http://localhost:8888/recette-api/private/role-admin/recette en mode post
apiRouter.route('/recette-api/private/role-admin/recette') // a changer
.post( function(req , res  , next ) {
	var nouvelleRecette = req.body;
	console.log("POST,nouvelleRecette="+JSON.stringify(nouvelleRecette));
	nouvelleRecette._id=nouvelleRecette.id; // ===========> a revoir
	myGenericMongoClient.genericInsertOne(collection,
										nouvelleRecette,
									     function(err,recette){
										     res.send(nouvelleRecette);
									    });
});

////////////////////////////////////////////////////////////// UPDATE //////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// http://localhost:8888/recette-api/private/role-admin/recette en mode PUT
// avec { "id" : "USD" , "nom" : "Dollar" , "change" : 1.123 } dans req.body
// apiRouter.route('/recette-api/private/role-admin/recette')
// .put( function(req , res  , next ) {
// 	var newValueOfRecetteToUpdate = req.body;
// 	console.log("PUT,newValueOfRecetteToUpdate="+JSON.stringify(newValueOfRecetteToUpdate));
// 	myGenericMongoClient.genericUpdateOne(collection,
// 	newValueOfRecetteToUpdate._id ,
// 	{//_id = newValueOfRecetteToUpdate._id,
// 		nomRecette : newValueOfRecetteToUpdate.nomRecette,
// 		imageRecette : newValueOfRecetteToUpdate.imageRecette,
// 		note = newValueOfRecetteToUpdate.note,
// 		portion = newValueOfRecetteToUpdate.portion,
// 		difficulte = newValueOfRecetteToUpdate.difficulte,
// 		budget = newValueOfRecetteToUpdate.budget,
// 		tpsPreparation = newValueOfRecetteToUpdate.tpsPreparation,
// 		tpsCuisson = newValueOfRecetteToUpdate.tpsCuisson,
// 		tpsTotal = newValueOfRecetteToUpdate.tpsTotal,
// 		ingredients = newValueOfRecetteToUpdate.ingredients,
// 		etapesPreparation = newValueOfRecetteToUpdate.etapesPreparation,
// 		materiels = newValueOfRecetteToUpdate.materiels,
// 		conseil = newValueOfRecetteToUpdate.conseil,
// 		typeRecette = newValueOfRecetteToUpdate.typeRecette,
// 		source = newValueOfRecetteToUpdate.source,
// 		site = newValueOfRecetteToUpdate.site,
// 		vegieOUpas = newValueOfRecetteToUpdate.vegieOUpas} , /////// a mettre tout les attributs d'une recette
// 	function(err,recette){
// 			if(err){
// 				res.status(404).json({ error : "no recette to update with id=" + newValueOfRecetteToUpdate.id });
// 			}else{
// 					res.send(newValueOfRecetteToUpdate);
// 			 }
// 	});	//end of genericUpdateOne()
// });

///////////////////////////////////////////////////////////////////////////// DELETE /////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
// http://localhost:8888/recette-api/private/role-admin/recette/ID en mode DELETE
apiRouter.route('/recette-api/private/role-admin/recette/:id')
.delete( function(req , res  , next ) {
	var idRecette = req.params.id;
	console.log("DELETE,idRecette="+idRecette);
	myGenericMongoClient.genericRemove(collection,{ _id : idRecette },
									     function(err,recette){
										     res.send({ deletedDeviseid : idRecette } );
									    });
});

 
exports.apiRouter = apiRouter;