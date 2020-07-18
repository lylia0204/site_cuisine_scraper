<img src="https://lylemi-projet-al04.s3.eu-west-3.amazonaws.com/image-logo/le-logo-noir.png">

Le projet Lyl'Emi Sugar and Salt est une application qui permet de trouver des recettes de cuisine.
Cette application est un regroupement de recettes venant de différents sites de recettes de cuisine.
Pour le moment il s'agit des sites *marmiton.org* et *750g.com*.
Ce projet a été construit avec une architecture back-end en **Spring Boot** et front-end **Angular 9**.
Les recettes scrapées en **NodeJS v12** et sont stockées dans une base de données non relationnnelle **MongoDB**.
Une autre base de données **MySQL** est utilisée pour stocker des données liées à l'utilisation du site, telles que l'enregistrement de compte utilisateur ou encore les ID des recettes favorites.

Ce projet est divisé en 4 repositories GitHub:  
https://github.com/lylia0204/site_cuisine_micro-services = microservice utilisateur : enregistrement utilisateurs et ajout aux favoris
https://github.com/lylia0204/site_cuisine_micro-services-recherche  = microservice recherche de recettes
https://github.com/lylia0204/site_cuisine-angular = partie Angular  
https://github.com/lylia0204/site_cuisine_scraper = partie alimentation de la base de donnée MongoDB (scrapping des sites).

Les technologies utilisées pour le deployement sont:  
AWS S3 pour le deployement des microservices  
AWS RDS pour l'hebergement de la base de données MySql.  
AWS  

---------------------------------------------------------------------------------------------------------------------------------------
# site_cuisine_scraper

Environnement de developpement:

**NodeJs V12** : Scrapping des données  
**Express**: Framework pour NodeJs   
**MongoDB**: Base de donnée à alimenter aprés scrapping 

Procédure:

IDE **VS Code** est trés bien pour cette partie.

Créer un dossier: (Git bash here)
```sh
$ git clone https://github.com/lylia0204/site_cuisine_scraper.git
$ cd site_cuisine_scraper
$ npm install
```
Créer un dossier .env pour les variables d'environnement : 

PORT : un port libre  
DB_NAME : Le nom de votre BDD
DB_URL:l'URL de votre BDD dans Mongo Atlas.

Executer l'application:  

```sh
$ node server.js
```



