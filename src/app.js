import loadEnvVariables from './utils/envHelper.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import express from "express";
import cors from "cors";

import initializeFirebase from './lib/firebase/initializeFirebase.js';
import logErrors from './utils/logErrors.js';
import paymentRoutes from './payment/payment.routes.js';
import confirmOrderRoutes from './order/confirm/confirmOrder.routes.js';

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
app.use('/client', cors(), confirmOrderRoutes);
app.use(logErrors)

app.get("*", (req, res) => {
    res.send("API NOT FOUND");
  });

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})