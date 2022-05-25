import SearchService from './search.service.js';
import CscSearchService from './cscSearch.service.js';

import BadRequestParameterError from '../lib/errors/bad-request-parameter.error.js';
import NoRecordFoundError from "../lib/errors/no-record-found.error.js";

const searchService = new SearchService();
const cscSearchService = new CscSearchService();

class SearchController {

    /**
    * search
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    search(req, res, next) {
        const searchRequest = req.body;

        searchService.search(searchRequest).then(response => {
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

    /**
    * sync search
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    syncSearch(req, res, next) {
        const searchRequest = req.body;

        cscSearchService.search(searchRequest).then(response => {
            if(!response || response === null)
                throw new NoRecordFoundError("No result found");
            else
                res.json(response);
        }).catch((err) => {
            next(err);
        });
    }
}

export default SearchController;
