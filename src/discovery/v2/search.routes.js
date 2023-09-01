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

// get item attributes
router.get(
    '/v2/attributes', authentication(), searchController.getAttributes,
);

// get item attributes values
router.get(
    '/v2/attributeValues', authentication(), searchController.getAttributesValues,
);

// get providers
router.get(
    '/v2/providers', authentication(), searchController.getProviders,
);

// get custom menus
router.get(
    '/v2/custom-menus', authentication(), searchController.getCustomMenus,
);

export default router;
