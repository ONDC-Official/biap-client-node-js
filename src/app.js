import loadEnvVariables from './utils/envHelper.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import express from "express";
import cors from "cors";

import paymentRoutes from './payment/payment.routes.js';
import initializeFirebase from './lib/firebase/initializeFirebase.js';

const app = express();

loadEnvVariables();
initializeFirebase();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.use(cors());
app.use('/api', cors(), paymentRoutes);


const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})