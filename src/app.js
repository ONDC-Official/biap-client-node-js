//import loadEnvVariables from './utils/envHelper.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import express from "express";
import cors from "cors";

import initializeFirebase from './lib/firebase/initializeFirebase.js';
import logErrors from './utils/logErrors.js';
import router from './utils/router.js';
import dbConnect from './database/mongooseConnector.js';

const app = express();

//loadEnvVariables();
initializeFirebase();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.use(cors());
app.use('/clientApis', cors(), router);
app.use(logErrors)

app.get("*", (req, res) => {
    res.send("API NOT FOUND");
  });

const port = process.env.PORT || 8080;

// app.listen(port, () => {
//     console.log(`Listening on port ${port}`);
// })

//Setup connection to the database
dbConnect()
    .then((db) => {
        console.log("Database connection successful");
        
        app.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });
    })
    .catch((error) => {
        console.log("Error connecting to the database", error);
        return;
    });