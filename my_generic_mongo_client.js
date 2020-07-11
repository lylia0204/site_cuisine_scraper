var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');

var mongoDbUrl = process.env.MONGODB_URI || MONGODB_URI;
var dbName =  process.env.DB_NAME || DB_NAME;
var currentDb = null; 
 
var setMongoDbUrl = function (dbUrl) {
	mongoDbUrl = dbUrl;
} 

var setMongoDbName = function (mongoDbName) {
	dbName = mongoDbName;
}

var closeCurrentMongoDBConnection = function () {
	currentDb.close();
	currentDb = null;
}

var executeInMongoDbConnection = function (callback_with_db) {
	if (currentDb == null) {
		MongoClient.connect(mongoDbUrl, { useUnifiedTopology: true }, function (err, db) {
			if (err != null) {
				console.log("mongoDb connection error = " + err + " for dbUrl=" + mongoDbUrl);
			}
			assert.equal(null, err);
			console.log("Connected correctly to mongodb database");
			//currentDb = db; //with mongodb client v2.x
			currentDb = db.db(dbName);//with mongodb client >= v3.x
			callback_with_db(currentDb);
			// db.close();   
		});
	} else {
		callback_with_db(currentDb);
	}
}

var genericUpdateOne = function (collectionName, id, changes, callback_with_err_and_results) {
	executeInMongoDbConnection(function (db) {
		db.collection(collectionName).updateOne({ '_id': id }, { $set: changes },
			function (err, results) {
				if (err != null) {
					console.log("genericUpdateOne error = " + err);
				}
				callback_with_err_and_results(err, results);
			});
	});
};

// mettre a jour plusieurs objets, et ajout des nouveaux
var genericUpdateOneScrap = function (collectionName, id, changes, callback_with_err_and_results) {
	executeInMongoDbConnection(function (db) {
		db.collection(collectionName).updateOne({ '_id': id }, { $set: changes }, { upsert: true },
			function (err, results) {
				if (err != null) {
					console.log("genericUpdateMany error = " + err);
				}
				callback_with_err_and_results(err, results);
			});
	});
};

// var genericInsertOne = function (collectionName, newOne, callback_with_err_and_newId) {
// 	executeInMongoDbConnection(function (db) {
// 		db.collection(collectionName).insertOne(newOne, function (err, result) {
// 			if (err != null) {
// 				console.log("genericInsertOne error = " + err);
// 				newId = null;
// 			}
// 			else {
// 				newId = newOne._id;
// 			}
// 			callback_with_err_and_newId(err, newId);
// 		});
// 	});
// };

var genericInsertOne = function (collectionName, newOne) {
	executeInMongoDbConnection(function (db) {
		db.collection(collectionName).insertOne(newOne, function (err, result) {
		})
		
	});
};

var genericFindList = function (collectionName, query, callback_with_err_and_array) {
	executeInMongoDbConnection(function (db) {
		var cursor = db.collection(collectionName).find(query);
		cursor.toArray(function (err, arr) {
			callback_with_err_and_array(err, arr);
		});
	});
};

var genericRemove = function (collectionName, query, callback_with_err_and_result) {
	executeInMongoDbConnection(function (db) {
		db.collection(collectionName).remove(query, function (err, obj) {
			if (err != null) {
				console.log("genericRemove error = " + err);
			}
			//if (err) throw err;
			console.log(obj.result.n + " document(s) deleted");
			callback_with_err_and_result(err, obj.result);
		});
	});
};

var genericDeleteOneById = function (collectionName, mongoIdAsString, callback_with_err_and_booleanResult) {
	executeInMongoDbConnection(function (db) {
		db.collection(collectionName).deleteOne({ '_id': new ObjectID(mongoIdAsString) }, function (err, obj) {
			if (err != null) {
				console.log("genericDeleteOneById error = " + err);
				callback_with_err_and_booleanResult(err, false);
			}
			else
				console.log(" 1 document deleted");
			callback_with_err_and_booleanResult(err, true);
		});
	});
};

var genericFindOne = function (collectionName, query, callback_with_err_and_item) {
	executeInMongoDbConnection(function (db) {
		db.collection(collectionName).findOne(query, function (err, item) {
			if (err != null) {
				console.log("genericFindById error = " + err);
			}
			assert.equal(null, err);
			callback_with_err_and_item(err, item);
		});
	});
};

exports.genericUpdateOne = genericUpdateOne;
exports.genericUpdateOneScrap = genericUpdateOneScrap;
//exports.genericUpdateMany = genericUpdateMany;
exports.genericInsertOne = genericInsertOne;
exports.genericFindList = genericFindList;
exports.genericFindOne = genericFindOne;
exports.genericRemove = genericRemove;
exports.genericDeleteOneById = genericDeleteOneById;
exports.setMongoDbUrl = setMongoDbUrl;
exports.setMongoDbName = setMongoDbName;
exports.executeInMongoDbConnection = executeInMongoDbConnection;
exports.closeCurrentMongoDBConnection = closeCurrentMongoDBConnection;