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
import mongoSanitize from 'express-mongo-sanitize';
import Redis from 'ioredis';
import helmet from 'helmet';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import validator from 'validator';
import appVersionValidator from '../src/middlewares/appVersionValidator.js'

const app = express();
global.redisCache = new Redis(process.env.BHASHINI_REDIS_PORT, process.env.BHASHINI_REDIS_HOST);
const window = new JSDOM('').window;
const purify = DOMPurify(window);

loadEnvVariables();
initializeFirebase();

app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(logger('combined'));

if (!process.env.CORS_WHITELIST_URLS) {
    throw new Error('CORS_WHITELIST_URLS environment variable is not set');
}

const whitelist = process.env.CORS_WHITELIST_URLS.split(",").map(url => url.trim());
console.log("CORS Whitelist: ", whitelist);

const corsOptionsDelegate = function (req, callback) {
    let corsOptions = { credentials: true };
    const origin = req.header('Origin');

    console.log('Request URL:', req.originalUrl);
    console.log('Request Headers:', JSON.stringify(req.headers));
    console.log('Request Origin:', origin);
    console.log('Whitelist:', whitelist);

    if (whitelist.includes(origin)) {
        corsOptions['origin'] = true;
    } else {
        corsOptions['origin'] = false;
    }

    console.log('CORS Options:', corsOptions);
    callback(null, corsOptions);
};

// Apply CORS middleware to all routes
app.use(cors(corsOptionsDelegate));

// Explicitly block disallowed origins
app.use((req, res, next) => {
    const origin = req.header('Origin');
    if (origin && !whitelist.includes(origin)) {
        return res.status(403).json({ error: 'CORS policy does not allow access from this origin.' });
    }
    next();
});

// Apply CORS with the dynamic options to routes starting with /clientApis
app.use('/clientApis',appVersionValidator(), router);

app.use(helmet.xssFilter());
// Custom function to escape special characters except for URLs
function customEscape(value) {
    if (typeof value === 'string') {
        if (validator.isURL(value, { require_protocol: true })) {
            return value;
        }
        return value;
    }
    return value;
}

// Recursive function to sanitize nested objects and arrays
function sanitize(input) {
    if (typeof input === 'string') {
        input = validator.trim(input);
        input = customEscape(input);
        return purify.sanitize(input);
    } else if (typeof input === 'object' && input !== null) {
        if (Array.isArray(input)) {
            return input.map(sanitize);
        } else {
            for (let key in input) {
                if (input.hasOwnProperty(key)) {
                    input[key] = sanitize(input[key]);
                }
            }
            return input;
        }
    } else {
        return input;
    }
}

// Middleware to sanitize input
app.use((req, res, next) => {
    req.body = sanitize(req.body);
    next();
});

app.use(mongoSanitize({
    onSanitize: ({ req, key }) => {
        console.warn(`This request[${key}] is sanitized`, req);
    },
}));

// Error handling middleware
app.use(logErrors);

app.get('/', (req, res) => {
    res.status(200).send('OK');
});


// Route not found handler
app.get("*", (req, res) => {
    res.status(404).send("API NOT FOUND");
});

const port = process.env.PORT || 8080;

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
