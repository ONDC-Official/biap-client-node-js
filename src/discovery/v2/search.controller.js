import SearchService from './search.service.js';
import BadRequestParameterError from '../../lib/errors/bad-request-parameter.error.js';
import NoRecordFoundError from "../../lib/errors/no-record-found.error.js";
import { SSE_CONNECTIONS } from '../../utils/sse.js';

const searchService = new SearchService();

class SearchController {

    /**
    * search
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    search(req, res, next) {
        const searchRequest = req.query;

        console.log({searchRequest})
        const headers = req.headers;

        let targetLanguage = headers['targetlanguage'];

        // if(targetLanguage==='en' || !targetLanguage) //default catalog is in english hence not considering this for translation
        // {
        //     targetLanguage = undefined
        // }
        searchService.search(searchRequest,targetLanguage).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    globalSearchItems(req, res, next) {
        const searchRequest = req.query;

        console.log({searchRequest})
        const headers = req.headers;

        let targetLanguage = headers['targetlanguage'];

        // if(targetLanguage==='en' || !targetLanguage) //default catalog is in english hence not considering this for translation
        // {
        //     targetLanguage = undefined
        // }
        searchService.globalSearchItems(searchRequest,targetLanguage).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    getProvideDetails(req, res, next) {
        const searchRequest = req.query;

        console.log({searchRequest})
        const headers = req.headers;

        let targetLanguage = headers['targetlanguage'];

        if(targetLanguage==='en' || !targetLanguage) //default catalog is in english hence not considering this for translation
        {
            targetLanguage = undefined
        }
        searchService.getProvideDetails(searchRequest,targetLanguage).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    getLocationDetails(req, res, next) {
        const searchRequest = req.query;

        console.log({searchRequest})
        const headers = req.headers;

        let targetLanguage = headers['targetlanguage'];

        searchService.getLocationDetails(searchRequest,targetLanguage).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    getItemDetails(req, res, next) {
        const searchRequest = req.query;

        console.log({searchRequest})
        const headers = req.headers;

        let targetLanguage = headers['targetlanguage'];

        if(targetLanguage==='en' || !targetLanguage) //default catalog is in english hence not considering this for translation
        {
            targetLanguage = undefined
        }
        searchService.getItemDetails(searchRequest,targetLanguage).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * get item
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    getItem(req, res, next) {
        const searchRequest = req.query;
        const {id:itemId} = req.params;

        console.log({searchRequest})

        searchService.getItem(searchRequest,itemId).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    getProvider(req, res, next) {
        const searchRequest = req.query;
        const {itemId} = req.params;

        console.log("get providers*****1*********" ,{searchRequest,itemId})

        searchService.getProvider(searchRequest,itemId).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response.response);
        }).catch((err) => {
            next(err);
        });
    }

    getLocation(req, res, next) {
        const searchRequest = req.query;
        const {id:locationId} = req.params;

        console.log({searchRequest})

        searchService.getLocation(searchRequest,locationId).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response.response);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * get attributes
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    getAttributes(req, res, next) {
        const searchRequest = req.query;

        console.log({searchRequest})

        searchService.getAttributes(searchRequest).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    getItems(req, res, next) {
        const searchRequest = req.query;

        console.log({searchRequest})

        console.log({searchRequest})
        const headers = req.headers;

        let targetLanguage = headers['targetlanguage'];

        searchService.getItems(searchRequest,targetLanguage).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response.response);
        }).catch((err) => {
            next(err);
        });
    }

    getLocations(req, res, next) {
        const searchRequest = req.query;

        console.log({searchRequest})
        const headers = req.headers;

        let targetLanguage = headers['targetlanguage'];

        searchService.getLocations(searchRequest,targetLanguage).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    getGlobalProviders(req, res, next) {
        const searchRequest = req.query;

        console.log({searchRequest})
        const headers = req.headers;

        let targetLanguage = headers['targetlanguage'];

        searchService.getGlobalProviders(searchRequest,targetLanguage).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * get attribute values
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    getAttributesValues(req, res, next) {
        const searchRequest = req.query;

        console.log({searchRequest})

        searchService.getAttributesValues(searchRequest).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * get providers
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    getProviders(req, res, next) {
        const searchRequest = req.query;
        const headers = req.headers;

        let targetLanguage = headers['targetlanguage'];

        if(targetLanguage==='en' || !targetLanguage) //default catalog is in english hence not considering this for translation
        {
            targetLanguage = undefined
        }
        searchService.getProviders(searchRequest,targetLanguage).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * get custom menu
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    getCustomMenu(req, res, next) {
        const searchRequest = req.query;

        console.log({searchRequest})

        searchService.getCustomMenu(searchRequest).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    
    getOffers(req, res, next) {
        const searchRequest = req.query;

        console.log({searchRequest})

        searchService.getOffers(searchRequest).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }
    /**
    * on search 
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onSearch(req, res, next) {
        const { query } = req;
        const { messageId } = query;

        if(messageId) {
            searchService.onSearch(query).then(result => {
                res.json(result);
            }).catch((err) => {
                next(err);
            });
        }
        else
            throw new BadRequestParameterError();
    }

    /**
    * filter 
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    getFilterParams(req, res, next) {
        const { query } = req;
        const { messageId } = query;
        
        if(messageId) {
            searchService.getFilterParams(query).then(result => {
                res.json(result);
            }).catch((err) => {
                next(err);
            });
        }
        else
            throw new BadRequestParameterError();
    }
}

export default SearchController;
