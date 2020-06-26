set MONGO_HOME=C:\Program Files\MongoDB\Server\4.2
cd /d "%~dp0" 
"%MONGO_HOME%\bin\mongoimport" --db recettes --collection recettes --drop --file dataset/recettes.json --jsonArray
pause