import {Router} from 'express';
import { authentication } from '../middlewares/index.js';

import BillingController from './billings/billing.controller.js';

const rootRouter = new Router();

const billingController = new BillingController();

//#region billing details

rootRouter.post(
    '/v1/billing_details', 
    authentication(),
    billingController.billingAddress,
);

rootRouter.get('/v1/billing_details', authentication(), billingController.onBillingDetails);

//#endregion

export default rootRouter;
