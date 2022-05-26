import SearchService from './search.service.js';
import { poll } from '../utils/apiUtil.js';
import { getCityList } from '../csc/districtDetails/db/dbService.js';

const searchService = new SearchService();

class CscSearchService {

    /**
     * 
     * @param {Object} searchRequest 
     * @returns 
     */
    async search(searchRequest) {
        try {
            let searchResponse = [];
            const cityList = await getCityList(searchRequest?.message?.criteria?.district_code);

            if (cityList && cityList.length) {
                searchResponse = await Promise.all(
                    cityList.map(async city => {
                        let request = {
                            context: searchRequest.context,
                            message: {
                                criteria: {
                                    search_string: searchRequest?.message?.criteria?.search_string,
                                    delivery_location: city.latitude + "," + city.longitude
                                }
                            }
                        }

                        const searchBppResponse = await searchService.search(request);

                        const pollResult = await poll(
                            async () => {
                                return await searchService.onSearch({
                                    messageId: searchBppResponse?.context?.message_id
                                }, true);
                            },
                            (result, count) => {
                                return count >= 6;
                            },
                            6,
                            2000
                        );

                        return [...pollResult?.message?.catalogs];
                    })
                );
            }

            return [...searchResponse].flat();
        }
        catch (err) {
            throw err;
        }
    }
}

export default CscSearchService;
