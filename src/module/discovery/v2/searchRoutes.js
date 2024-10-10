import { Router } from 'express';
import { authentication } from '../../../middlewares/index.js';
import SearchController from './searchController.js';

const router = new Router();
const searchController = new SearchController();

/**
 * Search routes
 */

// Search for items
router.get(
    '/v2/search',
    authentication(),
    searchController.search,
);

// Search globally for items
router.get(
    '/v2/search/global/items',
    authentication(),
    searchController.globalSearchItems,
);

// Get item details by ID
router.get(
    '/v2/items/:id',
    authentication(),
    searchController.getItem,
);

// Get providers for a specific item
router.get(
    '/v2/providers/:itemId',
    authentication(),
    searchController.getProvider,
);

// Get provider details
router.get(
    '/v2/provider-details',
    authentication(),
    searchController.getProvideDetails,
);

// Get location details
router.get(
    '/v2/location-details',
    authentication(),
    searchController.getLocationDetails,
);

// Get item details
router.get(
    '/v2/item-details',
    authentication(),
    searchController.getItemDetails,
);

// Get location by ID
router.get(
    '/v2/locations/:id',
    authentication(),
    searchController.getLocation,
);

// Get attributes
router.get(
    '/v2/attributes',
    authentication(),
    searchController.getAttributes,
);

// Get items
router.get(
    '/v2/items',
    authentication(),
    searchController.getItems,
);

// Get locations
router.get(
    '/v2/locations',
    authentication(),
    searchController.getLocations,
);

// Get nearest locations
router.get(
    '/v2/nearlocations',
    authentication(),
    searchController.getLocationsNearest,
);

// Get serviceable locations
router.get(
    '/v2/servieablelocations',authentication(),  searchController.servieablelocations,
);

// Get attribute values
router.get(
    '/v2/attributeValues',authentication(),  searchController.getAttributesValues,
);

// Get all providers
router.get(
    '/v2/providers',authentication(),  searchController.getProviders,
);

// Get global providers
router.get(
    '/v2/search/global/providers',authentication(),  searchController.getGlobalProviders,
);

// Get custom menus
router.get(
    '/v2/custom-menus',authentication(),  searchController.getCustomMenu,
);

// Get offers
router.get(
    '/v2/offers',authentication(),  searchController.getOffers,
);

// Get unique categories
router.get(
    '/v2/categories',authentication(),  searchController.getUniqueCategories,
);

// Get coupons
router.get(
    '/v2/coupons',authentication(),  searchController.getCoupons,
);

// Get widgets
router.get(
    '/v2/widget',authentication(),  searchController.getWidgets,
);

// Uncomment and modify as needed
// router.get(
//     '/v2/custom-menus/:id',
//     authentication(),
//     searchController.getProviderCustomMenus,
// );

// router.get(
//     '/v2/locations/:id',
//     authentication(),
//     searchController.getProviderLocations,
// );

// router.get(
//     '/v2/locations',
//     authentication(),
//     searchController.getLocations,
// );

// router.get(
//     '/v2/providers/:id',
//     authentication(),
//     searchController.getProviderDetails,
// );

export default router;
