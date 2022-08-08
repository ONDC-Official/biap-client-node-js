import {Router} from 'express';
import { authentication } from '../middlewares/index.js';

import changeFulfillmentType from './changeFulfillmentType/changeFulfillmentType.js';

const rootRouter = new Router();

//#region change fulfillment type

// change fulfillment type

rootRouter.post(
    '/migration/changeFulfillmentType',
    authentication(),
    changeFulfillmentType,
);

//#endregion

export default rootRouter;
