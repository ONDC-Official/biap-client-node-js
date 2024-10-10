import { Router } from 'express';
import { authentication } from '../../middlewares/index.js';

import BillingController from './billings/billingController.js';
import DeliveryAddressController from './deliveryAddress/deliveryAddressController.js';
import MapController from './map/map.controller.js';

const rootRouter = new Router();

const billingController = new BillingController();
const mapController = new MapController();
const deliveryAddressController = new DeliveryAddressController();

//#region billing details

// Route to add a billing address
rootRouter.post(
    '/v1/billing_details',
    authentication(),
    billingController.billingAddress,
);

// Route to get billing details
rootRouter.get(
    '/v1/billing_details',
    authentication(),
    billingController.onBillingDetails
);

// Route to update a billing address by ID
rootRouter.post(
    '/v1/update_billing_details/:id',
    authentication(),
    billingController.updateBillingAddress,
);

//#endregion

//#region delivery address details

// Route to add a delivery address
rootRouter.post(
    '/v1/delivery_address',
    authentication(),
    deliveryAddressController.deliveryAddress,
);

// Route to get delivery address details
rootRouter.get(
    '/v1/delivery_address',
    authentication(),
    deliveryAddressController.onDeliveryAddressDetails
);

// Route to update a delivery address by ID
rootRouter.post(
    '/v1/update_delivery_address/:id',
    authentication(),
    deliveryAddressController.updateDeliveryAddress,
);

// Route to get access token for the map
rootRouter.get(
    '/v2/map/accesstoken',
    authentication(),
    mapController.mmiToken
);

//#endregion

export default rootRouter;
