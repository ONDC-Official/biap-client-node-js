import {Router} from 'express';
import { authentication } from '../middlewares/index.js';

import BillingController from './billings/billing.controller.js';
import DeliveryAddressController from './deliveryAddress/deliveryAddress.controller.js';
import MapController from "./map/map.controller.js";

const rootRouter = new Router();

const billingController = new BillingController();
const mapController = new MapController();
const deliveryAddressController = new DeliveryAddressController();

//#region billing details

rootRouter.post(
    '/v1/billing_details', 
    authentication(),
    billingController.billingAddress,
);

rootRouter.get('/v1/billing_details', authentication(), billingController.onBillingDetails);

rootRouter.post(
    '/v1/update_billing_details/:id', 
    authentication(),
    billingController.updateBillingAddress,
);

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

rootRouter.post(
    '/v1/update_delivery_address/:id', 
    authentication(),
    deliveryAddressController.updateDeliveryAddress,
);

rootRouter.get(
    '/v2/map/accesstoken',
    authentication(),
    mapController.mmiToken
);

//#endregion
export default rootRouter;
