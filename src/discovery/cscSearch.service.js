import SearchService from './search.service.js';
import { poll } from '../utils/apiUtil.js';

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
            let cityList = [
                {
                    cityName: 'Pune City',
                    latitude: 18.5390590000001,
                    longitude: 73.8728280000001
                },
                {
                    cityName: 'Shirur',
                    latitude: 18.827864,
                    longitude: 74.3684180000001
                }
            ]
            
            if(cityList && cityList.length)
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
                            async ()=>{
                                return await searchService.onSearch({ 
                                    messageId: searchBppResponse?.context?.message_id 
                                });
                            }, 
                            (result, count) => {
                                return count >= 6;
                            },
                            6,
                            2000
                        );
                        return [ ...pollResult?.message?.catalogs ];
                    })
                );

            return [ ...searchResponse ].flat();
        }
        catch (err) {
            throw err;
        }
    }
}

export default CscSearchService;
