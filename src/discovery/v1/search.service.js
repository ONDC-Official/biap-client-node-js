import _ from "lodash";

import {onSearch} from "../../utils/protocolApis/index.js";

import ContextFactory from "../../factories/ContextFactory.js";
import BppSearchService from "./bppSearch.service.js";
import {CITY_CODE} from "../../utils/cityCode.js"
import createPeriod from "date-period";
// import logger from "../lib/logger";
const bppSearchService = new BppSearchService();

class SearchService {

    /**
     *
     * @param {Object} context
     */
    isBppFilterSpecified(context = {}) {
        return typeof context.bpp_id !== "undefined";
    }

    /**
     * search
     * @param {Object} searchRequest
     */
    async search(searchRequest = {}) {
        try {

            // logger.info(`[SearchService][search] Search product`, {params: searchRequest});

            const {context: requestContext = {}, message = {}} = searchRequest;
            const {criteria = {}, payment} = message;


            // console.log("City---------------->",city);
            const contextFactory = new ContextFactory();
            const protocolContext = contextFactory.create({
                transactionId: requestContext?.transaction_id,
                bppId: requestContext?.bpp_id,
                city: requestContext.city,
                state: requestContext.state
            });

            return await bppSearchService.search(
                protocolContext,
                {criteria, payment}
            );

        } catch (err) {
            throw err;
        }
    }

    convertHourMinuteToDate(storeOpenTillDate){

        let hours = storeOpenTillDate.substring(0, 2)
        let minutes= storeOpenTillDate.substring(2)

        //get hours and minutes from end
        let newDate = new Date().setHours(parseInt(hours),parseInt(minutes),0)

        return newDate
    }

    validateSchedule(searchObj) {
        console.log("location_id------>", searchObj.id);


          //  console.log(searchObj.location_details);
          //  console.log(searchObj.location_details.time);

            let nowDate = new Date();
            let todayTimeStamp = nowDate.getTime();
            let day = nowDate.getDay();

            if(day===0){
                day=7 //new date.getDate() gives 0 for sunday
            }
            let date = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();

            if (searchObj.location_details.time) {

                //check for days
                if (searchObj.location_details.time.days) {

                    let opendays = searchObj.location_details.time.days.split(",").map( Number );

                    console.log("day---->",day)
                    if (opendays.indexOf(day) !== -1) {
                        //allowed response
                        console.log("result is valid for the period", opendays)
                    } else {
                        console.log("invalid days---->", opendays)
                        return {status: false}
                    }
                } else {
                    //store is all day open
                    console.log("store is all day open")
                }

                //TODO: remove false and add searchObj.location_details.time.range
                if (searchObj.location_details.time.range) {  //check for range

                    let storeOpenTillDate = searchObj.location_details.time.range.end

                    //get hours and minutes from end

                    let newDate = this.convertHourMinuteToDate(storeOpenTillDate);

                    storeOpenTillDate = new Date(newDate);

                    searchObj.storeOpenTillDate = storeOpenTillDate

                    if(todayTimeStamp < storeOpenTillDate.getTime()){
                        console.log("[Range] store is open")
                        return {status: true, data:searchObj}
                    }else{
                        console.log("[Range] store is closed")
                        return {status: false}//TODO: return false
                    }

                }else if (searchObj.location_details.time.schedule) {
                    if (searchObj.location_details.time.schedule.holidays) {
                        if (date in searchObj.location_details.time.schedule.holidays) {
                            console.log("[Holiday]store is closed today")
                            return {status: false}
                        }else{
                            //allow response
                            console.log("[Holiday]store is open today")
                        }
                    } else {
                        //allow response
                        console.log("[Holiday]store is open today")
                    }


                    if(searchObj.location_details.time.schedule.frequency){

                        const timeOpen =searchObj.location_details.time.schedule.times
                        let storeOpenTime =null ;
                        const  firstTime = this.convertHourMinuteToDate(timeOpen[0]);
                        const  secondTime = this.convertHourMinuteToDate(timeOpen[1]);

                        if(todayTimeStamp>firstTime || todayTimeStamp<secondTime)
                        {
                            //take first timeStamp
                            storeOpenTime =new Date(firstTime)
                        }else{
                            //take second timestamp
                            storeOpenTime =new Date(secondTime)
                        }

                        let period =  createPeriod({start:storeOpenTime, duration:searchObj.location_details.time.schedule.frequency, recurrence: 1})

                        let storeOpenTillDate = new Date(period[1]);

                        searchObj.storeOpenTillDate = storeOpenTillDate

                        if(todayTimeStamp < storeOpenTillDate.getTime()){
                            console.log("[Range] store is open")
                            return {status: true, data:searchObj}
                        }else{
                            console.log("[Range] store is closed")
                            return {status: false}//TODO: return false
                        }
                    }

                }

            }



        return {status: true, data: searchObj}

    }

    validateQty(searchObj) {
      console.log("location_id------>",searchObj);

        if(!searchObj.quantity){
            searchObj.quantity =  { available: { count: 0 }, maximum: { count: 0 } }
        }

        return { data: searchObj}

    }

    /**
     * transform search results
     * @param {Array} searchResults
     */
    transform(searchResults = []) {
        let data = [];

        console.log("searchResults---",searchResults)

        searchResults && searchResults.length && searchResults.forEach(result => {
            let searchObj = {...result};
            // delete searchObj?.["context"];

            let validatedSearchObject = this.validateSchedule(searchObj);


            console.log("validated search object---->",validatedSearchObject)
            if (validatedSearchObject.status === true) {
                let validatedQty = this.validateQty(validatedSearchObject.data)
                data.push({
                    ...validatedSearchObject.data
                });
            }

        });

        return data;
    }

    /**
     * return filtering items
     * @param {Array} searchResults
     */
    getFilter(searchResults = []) {
        let providerList = new Map();
        let categoryList = new Map();
        let fulfillmentList = new Map();
        let minPrice = Infinity;
        let maxPrice = -Infinity;

        searchResults && searchResults.length && searchResults.forEach(result => {

            if (!_.isEmpty(result?.["provider_details"]))
                providerList.set(
                    result?.["provider_details"]?.id,
                    result?.["provider_details"]?.descriptor?.name
                );

            if (!_.isEmpty(result?.["category_details"]))
                categoryList.set(
                    result?.["category_details"]?.id,
                    result?.["category_details"]?.descriptor?.name
                );

            if (!_.isEmpty(result?.["fulfillment_details"]))
                fulfillmentList.set(
                    result?.["fulfillment_details"]?.id,
                    result?.["fulfillment_details"]
                );

            const value = parseFloat(result?.price?.value);
            if (maxPrice < value)
                maxPrice = value;

            if (minPrice > value)
                minPrice = value;
        });

        return {categoryList, fulfillmentList, minPrice, maxPrice, providerList};
    }

    /**
     * on search
     * @param {Object} queryParams
     */
    async onSearch(queryParams) {
        try {
            const {messageId} = queryParams;

            const protocolSearchResponse = await onSearch(queryParams);
            const searchResult = this.transform(protocolSearchResponse?.data);

            //console.log("protocolSearchResponse--------------------->",protocolSearchResponse.data[0].context)
            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                messageId: messageId
            });

            return {
                context,
                message: {
                    catalogs: [...searchResult],
                    count: protocolSearchResponse?.count
                },
            };
        } catch (err) {
            throw err;
        }
    }

    /**
     * get filter params
     * @param {String} query
     */
    async getFilterParams(query) {
        try {
            const protocolSearchResponse = await onSearch(query);

            const {
                categoryList = {},
                fulfillmentList = {},
                minPrice,
                maxPrice,
                providerList = {}
            } = this.getFilter(protocolSearchResponse?.data);

            return {
                categories: Array.from(categoryList, ([id, name]) => ({id, name})),
                fulfillment: Array.from(fulfillmentList, ([id, value]) => ({id, value})),
                minPrice: minPrice,
                maxPrice: maxPrice,
                providers: Array.from(providerList, ([id, name]) => ({id, name})),
            };
        } catch (err) {
            throw err;
        }
    }
}

export default SearchService;
