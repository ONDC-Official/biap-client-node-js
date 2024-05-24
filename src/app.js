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
import mongoSanitize from 'express-mongo-sanitize'
const app = express();
import Redis from 'ioredis';
global.redisCache = new Redis(process.env.BHASHINI_REDIS_PORT,process.env.BHASHINI_REDIS_HOST);
import helmet from 'helmet'
import DOMPurify from 'dompurify';
import {JSDOM} from 'jsdom';
import validator from 'validator';

loadEnvVariables();
initializeFirebase();

//app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json());
app.use(helmet.xssFilter());
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Custom function to escape special characters except for URLs
function customEscape(value) {
    if (typeof value === 'string') {
        // Check if the string is a valid URL
        if (validator.isURL(value, { require_protocol: true })) {
            return value; // Return the URL as is
        }
        return value
    }
    return value;
}

// Recursive function to sanitize nested objects and arrays
function sanitize(input) {
    if (typeof input === 'string') {
        input = validator.trim(input); // Remove whitespace
        input = customEscape(input); // Escape special characters, but not URLs
        return purify.sanitize(input); // Sanitize HTML
    } else if (typeof input === 'object' && input !== null) {
        if (Array.isArray(input)) {
            return input.map(sanitize); // Recursively sanitize each item in the array
        } else {
            for (let key in input) {
                if (input.hasOwnProperty(key)) {
                    input[key] = sanitize(input[key]); // Recursively sanitize each property in the object
                }
            }
            return input;
        }
    } else {
         return input
    }
}

// Middleware to sanitize input
app.use((req, res, next) => {
    req.body = sanitize(req.body);

    // console.log("--->",JSON.stringify(req.body))
    next();
});
app.use(
    mongoSanitize({
        onSanitize: ({ req, key }) => {
            console.warn(`This request[${key}] is sanitized`, req);
        },
    }),
);
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

const whitelist = process.env.CORS_WHITELIST_URLS.split(",");
const corsOptionsDelegate = function (req, callback) {
    let corsOptions = {credentials: true};
    console.log('req url ', req.originalUrl)
    console.log("req.header ",JSON.stringify(req.headers), whitelist);
    corsOptions['origin'] = (whitelist.indexOf(req.header('Origin')) !== -1);
    // corsOptions['exposedHeaders'] = 'set-cookie';
    console.log('corsOptions ',corsOptions)
    callback(null, corsOptions) // callback expects two parameters: error and optionsns
};

// app.use('/api', cors(corsOptionsDelegate))
// app.use(cors());
app.use('/clientApis',cors(corsOptionsDelegate), router);
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