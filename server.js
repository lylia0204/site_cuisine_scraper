require('dotenv').config()
var express = require('express');
var recetteApiRoutes = require('./recettes-api-routes.js');
var app = express();
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
app.use(jsonParser);

const port= process.env.PORT || PORT ;

app.use('/html', express.static(__dirname + "/html"));

app.get('/', function (req, res) { 
    res.redirect('/html/index.html');
});
app.use(recetteApiRoutes.apiRouter); 

app.listen(port, function () {
    console.log("http://localhost:8888 ou aws:8888");
});