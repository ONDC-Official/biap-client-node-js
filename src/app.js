import loadEnvVariables from './utils/envHelper.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import express from "express";
import cors from "cors";
import logger from 'morgan';
import initializeFirebase from './lib/firebase/initializeFirebase.js';
import logErrors from './utils/logErrors.js';
import router from './utils/router.js';
import dbConnect from './database/mongooseConnector.js';

const app = express();

loadEnvVariables();
initializeFirebase();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(logger('combined'))
//
// // Global exception handler for HTTP/HTTPS requests
// app.use(function (err, req, res, next) {
//
//     console.log('err.status==============>',err.status);
//     console.log('err.status==============>',err?.message);
//     console.log('err.status==============>',err?.stack);
//     // Send response status based on custom error code
//     if (err.status) {
//         return res.status(err.status).json({error: err.message});
//     }
//     res.status(500).json({ error: 'Something went wrong. Please try again' });
// });

app.use(cors());
app.use('/clientApis', cors(), router);
app.use(logErrors)
// app.use(logger('dev'));

app.get("*", (req, res) => {
    res.send("API NOT FOUND");
});



const port = process.env.PORT || 8080;

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