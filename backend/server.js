'use strict';

const fs = require('fs');
const util = require('util');
const Path = require('path');
const Pkg = require(Path.join(__dirname, '..', 'package.json'));
const express = require('express');
const app = express();

//Charge le package FuelSDK et crée un client à partir du fichier configAPI.json (Optionnel)
var ET_Client = require('fuelsdk-node');
var client;
fs.readFile("backend/configAPI.json", (err,data) =>{
    if(err){
        console.log('ERR config '+err);
    }
    let JSONdata = JSON.parse(data);
    client = new ET_Client(JSONdata.clientId, JSONdata.clientSecret, 's10');
});


// Register middleware that parses the request payload.
app.use(express.json());


// Route appelée pour chaque contact arrivant sur l'activité
app.post('/activity/execute', (req, res) => {
    let arg = req.body.inArguments[0]; //Récupère les arguments donnés par l'interface (customActivity.js)
    //Traitement sur les contacts...
    console.log('Hello world !'); //Chaque contact va faire un "Hello world !"
    return res.status(200).json({ success: true });
});



// Routes pour save, publish et validate. 
app.post(/\/activity\/save/, (req, res) => {
    console.log('SAVE');
    //Utilisé lorsque JourneyBuilder sauvegarde la config
    return res.status(200).json({ success: true });
});

app.post(/\/activity\/validate/, (req, res) => {
    console.log('VALIDATE');
    //Utilisé lorsque JourneyBuilder valide la config des activités
    return res.status(200).json({ success: true });
});

app.post(/\/activity\/publish/, (req, res) => {
    console.log('PUBLISH');
    //Utilisé lorsque JourneyBuilder commence ou fini une activation de trajet
    return res.status(200).json({ success: true });
});


// Donne l'interface de l'activité custom, sa config, ect...
app.use(express.static(Path.join(__dirname, '..', 'public')));

// Lance le server et écoute sur le port d'heroku
app.listen(process.env.PORT ||  12345, () => {
    console.log('Custom Activity backend is now running!');
});
