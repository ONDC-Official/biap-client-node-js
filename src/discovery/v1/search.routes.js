import {Router} from 'express';
import { authentication } from '../../middlewares/index.js';

import SearchController from './search.controller.js';

const router = new Router();
const searchController = new SearchController();

// search
router.post(
    '/v1/search', 
    authentication(),
    searchController.search,
);

// on search
router.get('/v1/on_search', authentication(), searchController.onSearch);

// filter
router.get('/v1/getFilterParams', authentication(), searchController.getFilterParams);

export default router;
