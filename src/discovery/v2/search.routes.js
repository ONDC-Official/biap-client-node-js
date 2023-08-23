import {Router} from 'express';
import { authentication } from '../../middlewares/index.js';

import SearchController from './search.controller.js';

const router = new Router();
const searchController = new SearchController();

// search
router.get(
    '/v2/search', authentication(), searchController.search,
);

// get item details
router.get(
    '/v2/items/:id', authentication(), searchController.getItem,
);

// get item details
router.get(
    '/v2/attributes', authentication(), searchController.getAttributes,
);

// get item details
router.get(
    '/v2/attributeValues', authentication(), searchController.getAttributesValues,
);

export default router;
