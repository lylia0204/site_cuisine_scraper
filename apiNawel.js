var express = require('express');
const apiRouter = express.Router();
//var app = express();
var myGenericMongoClient = require('./my_generic_mongo_client');
//CREATE
// http://localhost:3000/event-api/private/role-admin/event en mode post
// avec { "title1" : "mxyz" , "title2" : "monnaieXyz", "img1" : "null", "img2" : "null", "description" : "null", "date" : "null", "lieu": "null", "email": "null",
//    "siteWeb": "null", "tags" : "null" } dans req.body
apiRouter.route('/event-api/private/event')
.post( function(req , res  , next ) {
	var nouvelEvent = req.body;
	console.log("POST,nouvelEvent="+JSON.stringify(nouvelEvent));
	nouvelEvent._id=nouvelEvent.title1;
	myGenericMongoClient.genericInsertOne('eventtest',
                                            nouvelEvent,
									     function(err,event){
										     res.send(nouvelEvent);
									    });
});
//UPDATE
// http://localhost:3000/event-api/private/role-admin/event en mode PUT
// avec { "title1" : "mxyz" , "title2" : "monnaieXyz", "img1" : "null", "img2" : "null", "description" : "null", "date" : "null", "lieu": "null", "email": "null",
//    "siteWeb": "null", "tags" : "null" } dans req.body
apiRouter.route('/event-api/private/role-admin/updateEvent')
.put( function(req , res  , next ) {
	var newValueOfEventToUpdate = req.body;
	console.log("PUT,newValueOfEventToUpdate="+JSON.stringify(newValueOfEventToUpdate));
	myGenericMongoClient.genericUpdateOne('eventtest',
	newValueOfEventToUpdate._id ,
	{
		title1 : newValueOfEventToUpdate.title1,
		title2 : newValueOfEventToUpdate.title2,
		img1: newValueOfEventToUpdate.img1,
		img2: newValueOfEventToUpdate.img2,
		description: newValueOfEventToUpdate.description,
		date : newValueOfEventToUpdate.date,
		dateDebut : newValueOfEventToUpdate.dateDebut,
		dateFin : newValueOfEventToUpdate.dateFin,
		lieu: newValueOfEventToUpdate.lieu,
		city :  newValueOfEventToUpdate.city,
		country : newValueOfEventToUpdate.country,
		submitAbstract : newValueOfEventToUpdate.submitAbstract,
		register : newValueOfEventToUpdate.register,
		usefullLinks : newValueOfEventToUpdate.usefullLinks,
		email: newValueOfEventToUpdate.email,
		siteWeb: newValueOfEventToUpdate.siteWeb,
		tags: newValueOfEventToUpdate.tags,
	} ,
	function(err,event){
			if(err){
				res.json({ error : "no event to update with id=" + newValueOfEventToUpdate._id });
			}else{
					res.send(newValueOfEventToUpdate);
			 }
	});	//end of genericUpdateOne()
});
//GET ALL
//exemple URL: http://localhost:3000/devise-api/public/devise (returning all event)
//             http://localhost:3000/devise-api/public/devise?changeMini=2020-01-01
apiRouter.route('/event-api/public/events')
.get( function(req , res  , next ) {
	var changeMini = req.query.changeMini;
	var mongoQuery = changeMini ? { date: { $gte: date }  } : { } ;
	myGenericMongoClient.genericFindList('eventtest',mongoQuery,function(err,event){
		   res.send(event);
	});//end of genericFindList()
});
 //GET BY ID
//exemple URL: http://localhost:3000/event-api/public/event/c
apiRouter.route('/event-api/public/event/:_id')
.get( function(req , res  , next ) {
	var idEvent = req.params._id;
	console.log("OOOKKK")
	myGenericMongoClient.genericFindOne('eventtest',
										{ '_id' : idEvent },
									    function(err,event){
										   res.send(event);
									   });
});
//GET COMBINAISON CITY & COUNTRY
//exemple URL: localhost:3000/event-api/public/event (returning all devises)
//             http://localhost:3000/event-api/public/event?country=France
apiRouter.route('/event-api/public/event')
.get( function(req , res  , next ) {
	var cityParam = req.query.city;
	var countryParam = req.query.country;
if (cityParam != undefined){
	var mongoQuery = cityParam ? { city : cityParam } : { } ;
	//console.log("city" + cityParam)
}else {
	var mongoQuery = countryParam ? { country : countryParam } : { } ;
	//console.log("country" + countryParam)
}
 myGenericMongoClient.genericFindList("eventtest", mongoQuery, function(err, event) {
	if (err)
		res.send(err);
	res.json(event);
});
	
});
//DELETE BY ID
// http://localhost:8282/devise-api/private/role-admin/devise/EUR en mode DELETE
apiRouter.route('/event-api/private/role-admin/deleteEvent/:_id')
.delete( function(req , res  , next ) {
	var idEvent = req.params._id;
	console.log("DELETE,eventId="+idEvent);
	myGenericMongoClient.genericRemove('eventtest', { _id : idEvent } ,
									     function(err,event){
										     res.send({ Deleted :idEvent} );
									    });
});
//GET BY KEY WORD
//exemple URL: http://localhost:3000/devise-api/public/devise (returning all event)
//             http://localhost:3000/event-api/public/search?research=word
apiRouter.route('/event-api/public/search')
.get( function(req , res  , next ) {
	var research = req.query.research;
	console.log("coucou dans crud")
/* 	var mongoQuery = {title1: { $regex: research} } ;*/
		var mongoQuery = { $or: [
			{title1: { $regex: research, $options:'i'} },
			{title2: { $regex: research, $options:'i'} } ,
			{description: { $regex: research, $options:'i'} },
			{tags: { $regex: research, $options:'i'} },
			{city: { $regex: research, $options:'i'} },
			{country: { $regex: research, $options:'i'} }
		] } ;
		myGenericMongoClient.genericFindList('eventtest',mongoQuery,function(err,event){
			   res.send(event);
		});//end of genericFindList()
});
// BOTH WORKING COUNTRY AND CITY ALONE, NOT TOGETHER
/* //GET By CITY
//exemple URL: localhost:3000/event-api/public/event (returning all devises)
//             http://localhost:3000/event-api/public/event?city=Paris
apiRouter.route('/event-api/public/event')
.get( function(req , res  , next ) {
	var cityParam = req.query.city;
	var mongoQuery = cityParam ? { city : cityParam } : { } ;
	//var cityParam = req.params.city;
		console.log("city "+cityParam)
	 myGenericMongoClient.genericFindList("eventtest", mongoQuery, function(err, event) {
        if (err)
            res.send(err);
        res.json(event);
    });
});
//GET By COUNTRY
//exemple URL: localhost:3000/event-api/public/event (returning all devises)
//             http://localhost:3000/event-api/public/event?country=France
apiRouter.route('/event-api/public/event')
.get( function(req , res  , next ) {
	var countryParam = req.query.country;
	var mongoQuery = countryParam ? { country : countryParam } : { } ;
	//var cityParam = req.params.city;
		console.log("country" + countryParam)
	 myGenericMongoClient.genericFindList("eventtest", mongoQuery, function(err, event) {
        if (err)
            res.send(err);
        res.json(event);
    });
}); */
exports.apiRouter = apiRouter;