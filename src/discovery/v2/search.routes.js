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
    '/v2/providers/:itemId', authentication(), searchController.getProvider,
);

// get item details
router.get(
    '/v2/provider-details',authentication(),searchController.getProvideDetails,
);
// get item details
router.get(
    '/v2/location-details',authentication(),searchController.getLocationDetails,
);

// get item details
router.get(
    '/v2/item-details',authentication(),searchController.getItemDetails,
);

// get item details
router.get(
    '/v2/locations/:id', authentication(), searchController.getLocation,
);


router.get(
    '/v2/attributes', authentication(), searchController.getAttributes,
);

router.get(
    '/v2/items', searchController.getItems,
);

router.get(
    '/v2/locations', authentication(), searchController.getLocations,
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
