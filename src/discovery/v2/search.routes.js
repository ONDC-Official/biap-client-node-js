import {Router} from 'express';
import {bhashiniTranslator} from '../../middlewares/bhashiniTranslator/search.js';
import {providerTranslator} from '../../middlewares/bhashiniTranslator/provider.js';

import SearchController from './search.controller.js';

const router = new Router();
const searchController = new SearchController();

// search
router.get(
    '/v2/search',  
    searchController.search,bhashiniTranslator
    
);


// get item details
router.get(
    '/v2/items/:id/:',searchController.getItem
);

// get item details
router.get(
    '/v2/providers/:itemId',  searchController.getProvider,
);

// get item details
router.get(
    '/v2/locations/:id',  searchController.getLocation,
);


router.get(
    '/v2/attributes',  searchController.getAttributes
);

router.get(
    '/v2/items',  searchController.getItems
);

router.get(
    '/v2/locations', searchController.getLocations,
);

// get item attributes values
router.get(
    '/v2/attributeValues',  searchController.getAttributesValues,
);

// get providers
router.get(
    '/v2/providers',  searchController.getProviders
);

// get custom menus
router.get(
    '/v2/custom-menus',  searchController.getCustomMenus,
);

// // get custom menus
// router.get(
//     '/v2/custom-menus/:id', authentication(), searchController.getProviderCustomMenus,
// );
//
// // get item details
// router.get(
//     '/v2/locations/:id', authentication(), searchController.getProviderLocations,
// );
//
// // get item details
// router.get(
//     '/v2/locations', authentication(), searchController.getLocations,
// );
//
// // get providers
// router.get(
//     '/v2/providers/:id', authentication(), searchController.getProviderDetails,
// );

export default router;
