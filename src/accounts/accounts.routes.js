import {Router} from 'express';
import { authentication } from '../middlewares/index.js';

import BillingController from './billings/billing.controller.js';
import DeliveryAddressController from './deliveryAddress/deliveryAddress.controller.js';

const rootRouter = new Router();

const billingController = new BillingController();
const deliveryAddressController = new DeliveryAddressController();

//#region billing details

rootRouter.post(
    '/v1/billing_details', 
    authentication(),
    billingController.billingAddress,
);

rootRouter.get('/v1/billing_details', authentication(), billingController.onBillingDetails);

//#endregion

//#region delivery address details

rootRouter.post(
    '/v1/delivery_address', 
    authentication(),
    deliveryAddressController.deliveryAddress,
);

rootRouter.get(
    '/v1/delivery_address', 
    authentication(), 
    deliveryAddressController.onDeliveryAddressDetails
);

//#endregion
export default rootRouter;
