var express = require('express');
var articleApiRoutes = require('./articles-api-routes.js');
var app = express();
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
app.use(jsonParser);


// les routes en /html/... seront gérées par express
// par de simples renvois des fichiers statiques du répertoire "./html"
app.use('/html', express.static(__dirname + "/html"));

app.get('/', function (req, res) { 
    res.redirect('/html/index.html');
});
app.use(articleApiRoutes.apiRouter); //delegate REST API routes to apiRouter(s)

app.listen(9999, function () {
    console.log("http://localhost:9999");
});