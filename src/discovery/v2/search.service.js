import _ from "lodash";
import { onSearch } from "../../utils/protocolApis/index.js";
import ContextFactory from "../../factories/ContextFactory.js";
import BppSearchService from "./bppSearch.service.js";
import { CITY_CODE } from "../../utils/cityCode.js";
import { CATEGORIES } from "../../utils/categories.js";
import createPeriod from "date-period";
import translateObject from "../../utils/bhashini/translate.js";
import { OBJECT_TYPE } from "../../utils/constants.js";
// import logger from "../lib/logger";
const bppSearchService = new BppSearchService();
import client from "../../database/elasticSearch.js";
import moment from 'moment-timezone';
class SearchService {
  isBppFilterSpecified(context = {}) {
    return typeof context.bpp_id !== "undefined";
  }
  async search(searchRequest = {}, targetLanguage = "en") {
    try {
      let matchQuery = [];
      let shouldQuery = [];
  
      // bhashini translated data
      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });
      matchQuery.push({
        match: {
          "item_details.time.label": 'enable',
        },
      });
      matchQuery.push({
        terms: {
          "location_details.time.label": ['enable','open'],
        },
      });
      matchQuery.push({
        match: {
          "provider_details.time.label": 'enable',
        },
      });
  
      if (searchRequest.name) {
        matchQuery.push({
          match: {
            "item_details.descriptor.name": searchRequest.name,
          },
        });
      }
  
      if (searchRequest.providerIds) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.providerIds,
          },
        });
      }
  
      if (searchRequest.locationIds) {
        matchQuery.push({
          match: {
            "location_details.id": searchRequest.locationIds,
          },
        });
      }
  
      if (searchRequest.categoryIds) {
        matchQuery.push({
          match: {
            "item_details.category_id": searchRequest.categoryIds,
          },
        });
      }

      if (searchRequest.domain) {
        matchQuery.push({ match: { "context.domain": searchRequest.domain } });
      }
  
      for (const [key, value] of Object.entries(searchRequest)) {
        if (key.startsWith('product_attr_')) {
          const attributeName = key.slice('product_attr_'.length);
          let values = value.split(',');
          for (let valueObj of values) {
            if (valueObj) {
              shouldQuery.push({
                nested: {
                  path: "attribute_key_values",
                  query: {
                    bool: {
                      must: [
                        {
                          term: {
                            "attribute_key_values.key": attributeName,
                          },
                        },
                        {
                          term: {
                            "attribute_key_values.value": valueObj,
                          },
                        },
                      ],
                    },
                  },
                },
              });
            }
          }
        }
      }
  
      // for variants we set is_first = true
      matchQuery.push({
        match: {
          is_first: true,
        },
      });
  
      let query_obj = {
        bool: {
          must: matchQuery,
          should: shouldQuery,
          minimum_should_match: 0,
        },
      };
  
      // Apply function_score to boost in_stock=true items
      let finalQuery = {
        function_score: {
          query: query_obj,
          functions: [
            {
              filter: {
                term: { "in_stock": true },
              },
              weight: 10, // Boost for in-stock items
            },
            {
              filter: {
                term: { "in_stock": false },
              },
              weight: 1, // Lower weight for out-of-stock items
            },
          ],
          score_mode: "sum", // Ensure sum mode to add up scores
          boost_mode: "multiply", // Use multiply to enhance the effect of the weights
        },
      };
  
      // Calculate the starting point for the search
      let size = parseInt(searchRequest.limit);
      let page = parseInt(searchRequest.pageNumber);
      const from = (page - 1) * size;
  
      // Perform the search with pagination parameters
      let queryResults = await client.search({
        query: finalQuery,
        from: from,
        size: size,
      });
  
      // Extract the _source field from each hit
      let sources = queryResults.hits.hits.map((hit) => hit._source);
  
      // Get the total count of results
      let totalCount = queryResults.hits.total.value;
  
      for(let item_details of sources){

      if (item_details.item_details.parent_item_id) {
        // hit db to find all related items
        let matchQuery = [];

        matchQuery.push({
          match: {
            language: targetLanguage,
          },
        });

        matchQuery.push({
          match: {
            "item_details.parent_item_id":
              item_details.item_details.parent_item_id,
          },
        });

        // match provider id
        matchQuery.push({
          match: {
            "provider_details.id": item_details.provider_details.id,
          },
        });

        // match location id
        matchQuery.push({
          match: {
            "location_details.id": item_details.location_details.id,
          },
        });

        matchQuery.push(
          {
            match: {
              language: targetLanguage,
            },
          })

        let query_obj = {
          bool: {
            must: matchQuery,
          },
        };

        let queryResults = await client.search({
          query: query_obj,
          size:100
        });

        let related_items = queryResults.hits.hits.map(
          (hit) => {
           let data =  hit._source 

          },
        );
        if(related_items.length > 1){
          item_details.related_items = true
        }else{
          item_details.related_items = false
        }

      } else{
        item_details.related_items = false
      } 
      // Return the total count and the sources
      
      }
      return {
        response: {
          count: totalCount,
          data: sources,
          pages: Math.ceil(totalCount / size),
        },
      };
    } catch (err) {
      throw err;
    }
  }
  
  

  async globalSearchItems(searchRequest = {}, targetLanguage = "en") {
    try {
      let matchQuery = [];
      let searchQuery = [];
      
      // Base match queries
      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });
  
      matchQuery.push({
        match: {
          "item_details.time.label": 'enable',
        },
      });
  
      matchQuery.push({
        terms: {
          "location_details.time.label": ['enable','open'],
        },
      });
  
      matchQuery.push({
        match: {
          "provider_details.time.label": 'enable',
        },
      });
  
      matchQuery.push({
        match: {
          "type": 'item',
        },
      });
  
      if (searchRequest.name) {
        searchQuery.push({
          match: {
            "item_details.descriptor.name": searchRequest.name,
          },
        });
  
        searchQuery.push({
          match: {
            "item_details.descriptor.short_desc": searchRequest.name,
          },
        });
        searchQuery.push({
          match: {
            "item_details.descriptor.long_desc": searchRequest.name,
          },
        });
        searchQuery.push({
          match: {
            "item_details.category_id": searchRequest.name,
          },
        });
      }
  
      if (searchRequest.providerIds) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.providerIds,
          },
        });
      }
  
      if (searchRequest.categoryIds) {
        matchQuery.push({
          match: {
            "item_details.category_id": searchRequest.categoryIds,
          },
        });
      }
      // For variants we set is_first = true
      matchQuery.push({
        match: {
          is_first: true,
        },
      });
      
      // matchQuery.push({
      //   match: {
      //     "in_stock": true
      //   },
      // });
  
      let shouldQuery = []

      if(searchRequest.name){

       shouldQuery.push( {
          "match": {
            "item_details.descriptor.name": searchRequest.name
          },
        })

        shouldQuery.push({
          "match": {
            "item_details.category_id": searchRequest.name
          },
        })
       
      }

      if(searchRequest.category){
        shouldQuery.push({
          "match": {
            "item_details.category_id": searchRequest.category
          },
        })
      }

      // Define filter conditions
      let filterConditions = [
        {
          match: {
            "location_details.type": "pan",
          },
        },
      ];
  
      if (searchRequest.latitude && searchRequest.longitude) {
        filterConditions.push({
          geo_shape: {
            "location_details.polygons": {
              shape: {
                type: "point",
                coordinates: [
                  parseFloat(searchRequest.latitude),
                  parseFloat(searchRequest.longitude),
                ],
              },
            },
          },
        });
      }
  
      // Set the timezone to Asia/Kolkata (IST)
      const timezone = 'Asia/Kolkata';
  
      // Get the current time in the specified timezone
      const today = moment().tz(timezone);
  
      // Get the current day of the week (1 = Monday, ..., 7 = Sunday)
      const currentDay = today.day() === 0 ? 7 : today.day(); // Adjusting for Sunday
  
      // Get the current time in hours and minutes
      const hours = today.hours().toString().padStart(2, '0');
      const minutes = today.minutes().toString().padStart(2, '0');
      const currentTime = parseInt(hours + minutes, 10);
  
      console.log(`Current Day: ${currentDay}`);
      console.log(`Current Time: ${currentTime}`);
      let query_obj = {
        function_score: {
          query: {
            bool: {
              must: [
                {
                  bool: {
                    must: matchQuery,
                    should: shouldQuery,
                    minimum_should_match: 1
                  },
                },
                // Default language search
                {
                  match: {
                    language: targetLanguage,
                  },
                },
                {
                  bool: {
                    should: [
                      {
                        match: {
                          "location_details.type": "pan",
                        },
                      },
                      {
                        geo_shape: {
                          "location_details.polygons": {
                            shape: {
                              type: "point",
                              coordinates: [
                                parseFloat(searchRequest.latitude),
                                parseFloat(searchRequest.longitude),
                              ],
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          functions: [
            {
              filter: {
                bool: {
                  must_not: {
                    nested: {
                      path: `location_availabilities.${currentDay}`,
                      query: {
                        bool: {
                          must: [
                            { range: { [`location_availabilities.${currentDay}.start`]: { lte: currentTime } } },
                            { range: { [`location_availabilities.${currentDay}.end`]: { gte: currentTime } } }
                          ]
                        }
                      }
                    }
                  }
                }
              },
              weight: 10 // High weight for documents not matching the filter
            },
            {
              filter: {
                nested: {
                  path: `location_availabilities.${currentDay}`,
                  query: {
                    bool: {
                      should: [
                        {
                          bool: {
                            must: [
                              { range: { [`location_availabilities.${currentDay}.start`]: { lte: currentTime } } },
                              { range: { [`location_availabilities.${currentDay}.end`]: { gte: currentTime } } }
                            ]
                          }
                        }
                      ]
                    }
                  }
                }
              },
              weight: 0 // Low weight for documents matching the filter
            },
            // New filter for inStock
            {
              filter: {
                term: {
                  "in_stock": true
                }
              },
              weight: 0 // High weight for in-stock items
            },
            {
              filter: {
                bool: {
                  must_not: {
                    term: {
                      "in_stock": true
                    }
                  }
                }
              },
              weight: 10  // Low weight for out-of-stock items
            }
          ],
          score_mode: "sum", // Combine scores from all functions
          boost_mode: "replace" // Replace the final score with the score calculated by the functions
        }
      };
      // Calculate the starting point for the search
      let size = parseInt(searchRequest.limit);
      let page = parseInt(searchRequest.pageNumber);
      const from = (page - 1) * size;
  
      console.log(query_obj);
      // Perform the search with pagination parameters
      let queryResults = await client.search({
        index: 'items', // Ensure you specify the index name
        body: {
          query: query_obj,
          sort: [
            {
              _score: {
                order: "desc",
              },
            },
          ],
          from: from,
          size: size,
        },
      });
  
      // Extract the _source field from each hit
      let sources = queryResults.hits.hits.map((hit) => hit._source);
  
      for(let item_details of sources){

        if (item_details.item_details.parent_item_id) {
          // hit db to find all related items
          let matchQuery = [];
  
          matchQuery.push({
            match: {
              language: targetLanguage,
            },
          });
  
          matchQuery.push({
            match: {
              "item_details.parent_item_id":
                item_details.item_details.parent_item_id,
            },
          });
  
          // match provider id
          matchQuery.push({
            match: {
              "provider_details.id": item_details.provider_details.id,
            },
          });
  
          // match location id
          matchQuery.push({
            match: {
              "location_details.id": item_details.location_details.id,
            },
          });
  
          matchQuery.push(
            {
              match: {
                language: targetLanguage,
              },
            })
  
          let query_obj = {
            bool: {
              must: matchQuery,
            },
          };
  
          let queryResults = await client.search({
            query: query_obj,
            size:100
          });
  
          let related_items = queryResults.hits.hits.map(
            (hit) => {
             let data =  hit._source 
  
            },
          );

          console.log("related_items--->",related_items.length)
          if(related_items.length > 1){

            item_details.related_items = true
          }else{
            item_details.related_items = false
          }
  
        }else{
          item_details.related_items = false
        } 
        // Return the total count and the sources
        
        }

      // Get the total count of results
      let totalCount = queryResults.hits.total.value;
  
      // Return the total count and the sources
      return {
        count: totalCount,
        data: sources,
        pages: parseInt(Math.round(totalCount / size)),
      };
    } catch (err) {
      console.error("Error executing search query:", err);
      throw err;
    }
  }
  
  
  
  async getItems(searchRequest = {}, targetLanguage = "en") {
    try {
      let matchQuery = [];
  
      // Match on the target language
      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });
  
      // Match on customMenu if provided
      if (searchRequest.customMenu) {
        matchQuery.push({
          nested: {
            path: "customisation_menus",
            query: {
              bool: {
                must: [
                  {
                    match: {
                      "customisation_menus.id": searchRequest.customMenu,
                    },
                  },
                ],
              },
            },
          },
        });
      }
  
      let query_obj = {
        bool: {
          must: matchQuery,
        },
      };
  
      // Add function_score to boost in_stock items
      let boostedQuery = {
        function_score: {
          query: query_obj,
          functions: [
            {
              filter: {
                term: {
                  in_stock: true,
                },
              },
              weight: 2, // Adjust the weight as necessary
            },
            {
              filter: {
                term: { "in_stock": false },
              },
              weight: 1, // Lower weight for out-of-stock items
            },
          ],
          boost_mode: "multiply", // This will multiply the score by the weight
          score_mode: "sum", // Sum the scores to combine with the base query
        },
      };
  
      // Perform the search with the boosted query
      let queryResults = await client.search({
        body: {
          query: boostedQuery,
        },
      });
  
      // Extract the _source field from each hit
      let sources = queryResults.hits.hits.map((hit) => hit._source);
  
      // Get the total count of results
      let totalCount = queryResults.hits.total.value;
  
      // Return the total count and the sources
      return {
        response: {
          count: totalCount,
          data: sources,
          pages: totalCount,
        },
      };
    } catch (err) {
      throw err;
    }
  }
  
  async getProvideDetails(searchRequest = {}, targetLanguage = "en") {
    try {
      // id=pramaan.ondc.org/alpha/mock-server_ONDC:RET12_pramaan.ondc.org/alpha/mock-server
      let matchQuery = [];

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      matchQuery.push({
        match: {
          "type": 'item',
        },
      })

      if (searchRequest.id) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.id,
          },
        });
      }

      let query_obj = {
        bool: {
          must: matchQuery,
        },
      };

      let queryResults = await client.search({
        query: query_obj,
      });

      console.log(queryResults);

      let provider_details = null;
      if (queryResults.hits.hits.length > 0) {
        let details = queryResults.hits.hits[0]._source; // Return the source of the first hit
        provider_details = {
          domain: details.context.domain,
          bpp_details: details.bpp_details,
          ...details.provider_details,
        };
      }

      return provider_details;
    } catch (err) {
      throw err;
    }
  }

  async getLocationDetails(searchRequest = {}, targetLanguage = "en") {
    try {
      // providerIds=ondc-mock-server-dev.thewitslab.com_ONDC:RET10_ondc-mock-server-dev.thewitslab.com
      let matchQuery = [];

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      if (searchRequest.id) {
        matchQuery.push({
          match: {
            "location_details.id": searchRequest.id,
          },
        });
      }

      matchQuery.push({
        match: {
          "type": 'item',
        },
      });

      let query_obj = {
        bool: {
          must: matchQuery,
        },
      };

      let queryResults = await client.search({
        query: query_obj,
      });

      let location_details = null;
      if (queryResults.hits.hits.length > 0) {
        let details = queryResults.hits.hits[0]._source; // Return the source of the first hit
        let minDays=0;
        if(searchRequest.pincode){
          let docPincode = details.location_details.address.area_code;
          let matchCount = 0;
          for (let i = 0; i < searchRequest.pincode.length; i++) {
            if (i < docPincode.length && searchRequest.pincode.charAt(i) == docPincode.charAt(i)) {
              matchCount++;
            }else {
              break;
          }
          }
          if (matchCount == 6) minDays = 15*60;
          else if (matchCount == 5) minDays = 30*60;
          else if (matchCount == 4) minDays = 45*60;
          else if (matchCount == 3) minDays = 60*60;
          else if (matchCount == 2) minDays = 1440*60;
          else if (matchCount == 1) minDays = 1440*60;
          else minDays = 10080*60; //other state
        }
        location_details = {
          domain: details.context.domain,
          minDays:minDays,
          minDaysWithTTS : minDays + details.location_details.median_time_to_ship,
          provider_descriptor: details.provider_details.descriptor,
          provider_details: details.provider_details,
          ...details.location_details,
          fulfillment:details.fulfillment,
          time_to_ship: details.item_details["@ondc/org/time_to_ship"]
        };
      }

      return location_details;
    } catch (err) {
      throw err;
    }
  }

  async getItemDetails(searchRequest = {}, targetLanguage = "en") {
    try {
      // providerIds=ondc-mock-server-dev.thewitslab.com_ONDC:RET10_ondc-mock-server-dev.thewitslab.com
      let matchQuery = [];

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      if (searchRequest.id) {
        matchQuery.push({
          match: {
            id: searchRequest.id,
          },
        });
      }

      let query_obj = {
        bool: {
          must: matchQuery,
        },
      };

      let queryResults = await client.search({
        index: 'items',
        query: query_obj,
      });

      let item_details = null;
      if (queryResults.hits.hits.length > 0) {
        item_details = queryResults.hits.hits[0]._source; // Return the source of the first hit
        item_details.customisation_items = [];

        // add variant details if available
        if (item_details.item_details.parent_item_id) {
          // hit db to find all related items
          let matchQuery = [];

          matchQuery.push({
            match: {
              language: targetLanguage,
            },
          });

          matchQuery.push({
            match: {
              "item_details.parent_item_id":
                item_details.item_details.parent_item_id,
            },
          });

          // match provider id
          matchQuery.push({
            match: {
              "provider_details.id": item_details.provider_details.id,
            },
          });

          // match location id
          matchQuery.push({
            match: {
              "location_details.id": item_details.location_details.id,
            },
          });

          matchQuery.push(
            {
              match: {
                language: targetLanguage,
              },
            })

          let query_obj = {
            bool: {
              must: matchQuery,
            },
          };

          let queryResults = await client.search({
            query: query_obj,
            size:100
          });

          item_details.related_items = queryResults.hits.hits.map(
            (hit) => {
             let data =  hit._source 

                   //map attribute keys 
      const flatObject = {};
      if(data.attribute_key_values && data.attribute_key_values.length>0){
        data.attribute_key_values.forEach(pair => {
          flatObject[pair.key] = pair.value;
      });
      }
      data.attributes = flatObject

            return  data;
            
            },
          );
        } else if (item_details.customisation_groups.length > 0) {
          //fetch all customisation items - customisation_group_id
          let customisationQuery = [];
          let groupIds = item_details.customisation_groups.map((data) => {
            return data.id;
          });

          console.log("groupids---->", groupIds);
          customisationQuery.push({
            terms: {
              customisation_group_id: groupIds,
            },
          });

          // Add the match query for type
          customisationQuery.push({
            match: {
              type: "customization",
            },
          });

          customisationQuery.push(
            {
              match: {
                language: targetLanguage,
              },
            });
            
          // Create the query object
          let query_obj = {
            bool: {
              must: customisationQuery,
            },
          };

          let queryResults = await client.search({
            query: query_obj,
            size: 100
          });

          console.log(queryResults);
          item_details.customisation_items = queryResults.hits.hits.map(
            (hit) => hit._source,
          );
        }
      }
                 console.log("itemdetails--->",item_details)
      if(item_details){
        item_details.locations = [item_details.location_details]

      //map attribute keys 
      const flatObject = {};
      if(item_details.attribute_key_values && item_details.attribute_key_values.length>0){
        item_details.attribute_key_values.forEach(pair => {
          flatObject[pair.key] = pair.value;
      });
      }
      item_details.attributes = flatObject

      }           

      return item_details;

      // TODO: attach related items
      // TODO: attach customisations
    } catch (err) {
      throw err;
    }
  }

  async getAttributes(searchRequest) {
    try {
      let matchQuery = [];
  
      if (searchRequest.category) {
        matchQuery.push({
          match: {
            "item_details.category_id": searchRequest.category,
          },
        });
      }
      matchQuery.push({
        match: {
          "item_details.time.label": 'enable',
        },
      });
      matchQuery.push({
        terms: {
          "location_details.time.label": ['enable','open'],
        },
      });
      matchQuery.push({
        match: {
          "provider_details.time.label": 'enable',
        },
      });
      matchQuery.push({
        match: {
          "type": 'item',
        },
      })
  
      if (searchRequest.provider) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.provider,
          },
        });
      }
  
      const response = await client.search({
        index: 'items',
        size: 0, // We don't need actual documents, only aggregation results
        body: {
          query: {
            bool: {
              must: matchQuery
            }
          },
          aggs: {
            unique_attribute_keys: {
              nested: {
                path: 'attribute_key_values'
              },
              aggs: {
                unique_keys: {
                  terms: {
                    field: 'attribute_key_values.key',
                    size: 1000  // Adjust the size as needed
                  }
                }
              }
            }
          }
        }
      });
  
      const uniqueKeys = response.aggregations.unique_attribute_keys.unique_keys.buckets.map((bucket) =>  { return {code:bucket.key}});
      console.log(uniqueKeys);

      return { response: { data: uniqueKeys, count: uniqueKeys.length, pages: 1 } };
      

    } catch (err) {
      throw err;
    }
  }

  async getUniqueCategories(searchRequest, targetLanguage = "en") {
    let matchQuery = [];

    if (searchRequest.domain) {
      matchQuery.push({
        match: {
          "context.domain": searchRequest.domain,
        },
      });
    }

    matchQuery.push({
      match: {
        language: targetLanguage,
      },
    });

    matchQuery.push({
      match: {
        "item_details.time.label": 'enable',
      },
    });
    matchQuery.push({
      terms: {
        "location_details.time.label": ['enable','open'],
      },
    });
    matchQuery.push({
      match: {
        "provider_details.time.label": 'enable',
      },
    });

    matchQuery.push({
      match: {
        "type": 'item',
      },
    })

    let query_obj = {
      bool: {
        must: matchQuery,
      },
    };

    const totalCategories = await client.search({
      index: "items",
      size: 0,
      query: query_obj,
      aggs: {
        domainCategories: {
          terms: {
            field: "context.domain",
            size:10000000
          },
          aggs: {
            uniqueCategories: {
              terms: {
                field: "item_details.category_id",
                size:1000000
              },
            },
          },
        },
      },
    });

    console.log("CATEGORIES", totalCategories);
  
    const domainBuckets = totalCategories.aggregations.domainCategories.buckets;

    console.log("DOMAIN BUCKETS", totalCategories.aggregations.domainCategories.buckets);

    let result = {};
  
    domainBuckets.forEach(domainBucket => {
      const domainName = domainBucket.key;
      const uniqueCategories = domainBucket.uniqueCategories.buckets.map(category => {

        return { code: category.key, label: category.key,url:CATEGORIES[category.key] };
      });
  
      result[domainName] = uniqueCategories;
    });

      return result;
  }
  
  async getAttributesValues(searchRequest) {
    try {
      let matchQuery = [];
  
      if (searchRequest.category) {
        matchQuery.push({
          match: {
            "item_details.category_id": searchRequest.category,
          },
        });
      }
  
      matchQuery.push({
        match: {
          "item_details.time.label": 'enable',
        },
      });

      matchQuery.push({
        match: {
          "type": 'item',
        },
      })

      if (searchRequest.provider) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.provider,
          },
        });
      }
  
      // Create the nested query based on the provided attribute key
      let attributeQuery = {
        nested: {
          path: "attribute_key_values",
          query: {
            bool: {
              must: [
                { term: { "attribute_key_values.key": searchRequest.attribute_code} }  // Replace "gender" as needed
              ]
            }
          }
        }
      };
  
      // Combine all the queries
      const response = await client.search({
        index: 'items',
        body: {
          size: 0,
          query: {
            bool: {
              must: [
                ...matchQuery,
                attributeQuery
              ]
            }
          },
          aggs: {
            unique_attribute_values: {
              nested: {
                path: "attribute_key_values"
              },
              aggs: {
                filtered_attribute: {
                  filter: {
                    term: {
                      "attribute_key_values.key": searchRequest.attribute_code// Replace "gender" as needed
                    }
                  },
                  aggs: {
                    unique_values: {
                      terms: {
                        field: "attribute_key_values.value",
                        size: 1000  // Adjust the size as needed
                      }
                    }
                  }
                }
              }
            }
          }
        },
      });
  
      // Access the aggregation results correctly
      const uniqueValues = response.aggregations.unique_attribute_values.filtered_attribute.unique_values.buckets.map(
        (bucket) => bucket.key,
      );
  
      // Return the result
      return { response: { data: uniqueValues, count: uniqueValues.length } };
  
    } catch (err) {
      throw err;
    }
  }
  async getLocations(searchRequest, targetLanguage = "en") {
    try {
        // Match queries for filtering
        let matchQuery = [
            { match: { language: targetLanguage } },
            { match: { type: 'item' } }
        ];

        matchQuery.push({
          terms: {
            "location_details.time.label": ['enable','open'],
          },
        });
        matchQuery.push({
          match: {
            "provider_details.time.label": 'enable',
          },
        });

        if (searchRequest.domain) {
            matchQuery.push({ match: { "context.domain": searchRequest.domain } });
        }

        let query_obj = {
            function_score: {
                query: {
                    bool: {
                        must: matchQuery,
                        should: [
                            {
                                geo_shape: {
                                    "location_details.polygons": {
                                        shape: {
                                            type: "point",
                                            coordinates: [
                                                parseFloat(searchRequest.latitude),
                                                parseFloat(searchRequest.longitude),
                                            ],
                                        }
                                    }
                                }
                            },
                            {
                                match: {
                                    "location_details.type": "pan",
                                }
                            }
                        ],
                        minimum_should_match: 1
                    }
                },
                functions: [
                    {
                        filter: {
                            geo_shape: {
                                "location_details.polygons": {
                                    shape: {
                                        type: "point",
                                        coordinates: [
                                            parseFloat(searchRequest.latitude),
                                            parseFloat(searchRequest.longitude),
                                        ],
                                    }
                                }
                            }
                        },
                        weight: 2 // Boost for geo_shape matches
                    },
                    {
                        filter: {
                            match: {
                                "location_details.type": "pan",
                            }
                        },
                        weight: 0.5 // Lower boost for match type
                    }
                ],
                score_mode: "sum",
                boost_mode: "multiply"
            }
        };

        // Perform the Elasticsearch search with sorting by _score
        let queryResults = await client.search({
            index: 'items', // Replace with your index name
            body: {
                query: query_obj,
                sort: [
                    { "_score": { "order": "desc" } } // Prioritize based on score
                ],
                aggs: {
                    "unique_location": {
                        composite: {
                            size: searchRequest.limit,
                            sources: [
                                { location_id: { terms: { field: "location_details.id" } } }
                            ],
                            after: searchRequest.afterKey ? { location_id: searchRequest.afterKey } : undefined
                        },
                        "aggs": {
                            "top_products": {
                                "top_hits": {
                                    "size": 1,
                                    "sort": [
                                        { "location_details.median_time_to_ship": { "order": "asc" } }
                                    ],
                                }
                            },
                            "location_time_to_ship": {
                                "min": {
                                    "field": "location_details.median_time_to_ship"
                                }
                            },
                            "sorted_buckets": {
                                "bucket_sort": {
                                    "sort": [
                                        { "location_time_to_ship": { "order": "asc" } }
                                    ]
                                }
                            }
                        }
                    },
                    "unique_location_count": {
                        "cardinality": {
                            "field": "location_details.id"
                        }
                    }
                },
                //size: 0 // We don't need hits, just aggregations
            }
        });

        // Extract unique locations from aggregation results
        let unique_locations = queryResults.aggregations.unique_location.buckets.map(bucket => {
            const details = bucket.top_products.hits.hits[0]._source;
            return {
                domain: details.context.domain,
                provider_descriptor: details.provider_details.descriptor,
                provider: details.provider_details.id,
                ...details.location_details,
            };
        });

        // Get total count and pagination details
        let totalCount = queryResults.aggregations.unique_location_count.value;
        let totalPages = Math.ceil(totalCount / searchRequest.limit);
        let afterKey = queryResults.aggregations.unique_location.after_key;

        // Return the response with count, data, afterKey, and pages
        return {
            count: totalCount,
            data: unique_locations,
            afterKey: afterKey,
            pages: totalPages,
        };

    } catch (err) {
        throw err;
    }
}


async getLocationsNearest(searchRequest, targetLanguage = "en") {
  try {
      function haversineDistance(lat1, lon1, lat2, lon2) {
          const toRadians = (degree) => degree * Math.PI / 180;
          const R = 6371; // Radius of the Earth in km
          const dLat = toRadians(lat2 - lat1);
          const dLon = toRadians(lon2 - lon1);
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return (R * c) * 1.4; // Distance in km * 1.4 approximate routing distance
      };

      // Match queries for filtering common conditions
      let matchQuery = [
          { match: { language: targetLanguage } },
          { match: { type: 'item' } }
      ];

      if (searchRequest.domain) {
          matchQuery.push({ match: { "context.domain": searchRequest.domain } });
      }

      if (searchRequest.provider) {
          matchQuery.push({ match: { "provider_details.id": searchRequest.provider } });
      }

      let TTS = 24 * 3600; // ie. 60 hours

      if (!searchRequest.limitExtended) {
        searchRequest.limitExtended = 1000;
      }

      // Aggregation query with sorting by median_time_to_ship
      let aggr_query = {
          unique_location: {
              composite: {
                  size: 100,
                  sources: [
                      { location_id: { terms: { field: "location_details.id" } } }
                  ],
                  after: searchRequest.afterKey ? { location_id: searchRequest.afterKey } : undefined
              },
              aggs: {
                  products: {
                      top_hits: {
                          size: 1,
                  //         sort: [
                  //             { "location_details.median_time_to_ship": { order: "asc" } }
                  //         ]
                      }
                  }
              }
          },
          unique_location_count: {
              cardinality: {
                  field: "location_details.id"
              }
          }
      };

      let serviceabilityFilter = [
          {
              bool: {
                  should: [
                      {
                          geo_shape: {
                              "location_details.polygons": {
                                  relation: "intersects",
                                  shape: {
                                      type: "point",
                                      coordinates: [
                                          parseFloat(searchRequest.latitude),
                                          parseFloat(searchRequest.longitude),
                                      ],
                                  },
                              },
                          },
                      },
                  ],
              },
          },
      ];

      // First query: Results within 5km
      let queryTTSLess = {
          bool: {
              must: [
                  ...matchQuery,
                  {
                      range: {
                          "location_details.median_time_to_ship": {
                              lte: TTS // 24 hours in seconds
                          }
                      }
                  }
              ],
              filter: serviceabilityFilter
          }
      };

      // Perform the Elasticsearch search for within 5km
      let resultsTTSLess = await client.search({
          index: 'items', // specify your index name
          body: {
              query: queryTTSLess,
              aggs: aggr_query,
              size: 0
          }
      });

   
      // Extract and process hits from both query results
      let hitsWithinTTS = resultsTTSLess.aggregations.unique_location.buckets.map(bucket => {
          const details = bucket.products.hits.hits[0]._source;
          if (details.location_details.circle && details.location_details.circle.gps) {
              const [lat, lon] = details.location_details.circle.gps.split(',').map(parseFloat);
              const distance = haversineDistance(
                  parseFloat(searchRequest.latitude),
                  parseFloat(searchRequest.longitude),
                  lat,
                  lon
              );
              return {
                  domain: details.context.domain,
                  provider_descriptor: { name: details.provider_details.descriptor.name, symbol: details.provider_details.descriptor.symbol, images: details.provider_details.descriptor.images },
                  provider: details.provider_details.id,
                  location: details.location_details.id,
                  distance: distance,
                  distance_time_to_ship: ((distance * 60) / 15) + (details.location_details.median_time_to_ship / 60),
                  median_time_to_ship: details.location_details.median_time_to_ship,
                  timeToShip: details.location_details.time_to_ship
              };
          } else {
              return null; // Exclude results without GPS data
          }
      }).filter(result => result !== null) // Remove null entries
      .sort((a, b) => a.distance_time_to_ship - b.distance_time_to_ship);; // Remove null entries

      // Merge results
      let allResults = [...hitsWithinTTS];

      // Get the unique provider count from both results
      let totalCount = resultsTTSLess.aggregations.unique_location_count.value 

      // Return the combined results
      return {
          count: totalCount,
          data: allResults.slice(0, 20),
          pages: null,
          afterKey: { location_id: "location_id" } // to make web UI backward compatible
      };
  } catch (err) {
      console.error(err); // Log the error for debugging
      throw err;
  }
}


async getGlobalProviders(searchRequest, targetLanguage = "en") {
  try {
    console.log("searchRequest", searchRequest);

    let matchQuery = [];
    matchQuery.push({
      match: {
        "item_details.time.label": 'enable',
      },
    });
    matchQuery.push({
      terms: {
        "location_details.time.label": ['enable','open'],
      },
    });
    matchQuery.push({
      match: {
        "provider_details.time.label": 'enable',
      },
    });
    matchQuery.push({
      match: {
        "in_stock": true
      },
    });
    matchQuery.push({ exists: { field: "item_details" } })

    let shouldQuery = [

    ]

    if(searchRequest.subcategory){
      shouldQuery.push({
        "match": {
          "item_details.category_id": searchRequest.subcategory
        }
      })
    }

    if(searchRequest.category){
      shouldQuery.push({
        "match": {
          "context.domain": searchRequest.category
        }
      })
    }

    if(searchRequest.name){
      shouldQuery.push({
        "match": {
          "provider_details.descriptor.name": searchRequest.name
        }
      })
      shouldQuery.push({
        "match": {
          "item_details.descriptor.name": searchRequest.name
        },
      })
      // {
      //   "wildcard": {
      //     "item_details.descriptor.short_desc": `*${searchRequest.name}*`
      //   },
      // },
      // {
      //   "wildcard": {
      //     "item_details.descriptor.long_desc":`*${searchRequest.name}*`
      //   },
      // },
      shouldQuery.push({
        "match": {
          "item_details.category_id": searchRequest.name
        },
      })
    }

    // Set the timezone to Asia/Kolkata (IST)
    const timezone = 'Asia/Kolkata';

    // Get the current time in the specified timezone
    const today = moment().tz(timezone);
    
    // Get the current day of the week (1 = Monday, ..., 7 = Sunday)
    const currentDay = today.day() === 0 ? 7 : today.day(); // Adjusting for Sunday
    
     // Get the current time in hours and minutes
    const hours = today.hours().toString().padStart(2, '0');
    const minutes = today.minutes().toString().padStart(2, '0');
    const currentTime = parseInt(hours + minutes, 10);
    
    console.log(`Current Day: ${currentDay}`);
    console.log(`Current Time: ${currentTime}`);

    // Base query object with additional filters
    let query_obj = {
      function_score: {
        query: {
          bool: {
            must: [
              {
                bool: {
                  must: matchQuery,
                  should: shouldQuery,
                  minimum_should_match: 1
                },
              },
              // Default language search
              {
                match: {
                  language: targetLanguage,
                },
              },
              {
                bool: {
                  should: [
                    {
                      match: {
                        "location_details.type": "pan",
                      },
                    },
                    {
                      geo_shape: {
                        "location_details.polygons": {
                          shape: {
                            type: "point",
                            coordinates: [
                              parseFloat(searchRequest.latitude),
                              parseFloat(searchRequest.longitude),
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        functions: [
          {
            filter: {
              bool: {
                must_not: {
                  nested: {
                    path: `location_availabilities.${currentDay}`,
                    query: {
                      bool: {
                        must: [
                          { range: { [`location_availabilities.${currentDay}.start`]: { lte: currentTime } } },
                          { range: { [`location_availabilities.${currentDay}.end`]: { gte: currentTime } } }
                        ]
                      }
                    }
                  }
                }
              }
            },
            weight: 10000000 // High weight for documents not matching the filter
          },
          {
            filter: {
              nested: {
                path: `location_availabilities.${currentDay}`,
                query: {
                  bool: {
                    should: [
                      {
                        bool: {
                          must: [
                            { range: { [`location_availabilities.${currentDay}.start`]: { lte: currentTime } } },
                            { range: { [`location_availabilities.${currentDay}.end`]: { gte: currentTime } } }
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            },
            weight: 0 // Low weight for documents matching the filter
          },
          // New filter for inStock
          {
            filter: {
              term: {
                "in_stock": true
              }
            },
            weight: 10 // High weight for in-stock items
          },
          {
            filter: {
              bool: {
                must_not: {
                  term: {
                    "in_stock": true
                  }
                }
              }
            },
            weight: 0 // Low weight for out-of-stock items
          },
          {
            filter: {
                bool: {
                    must_not: {
                        range: {
                            "enable_percentage": {
                                gte: 80 //TODO: make it configurable
                            }
                        }
                    }
                }
            },
            weight: 0 // Weight for documents where enable_percentage is < 100
        },
        {
          filter: {
              bool: {
                  must: {
                      range: {
                          "enable_percentage": {
                              gte: 80 //TODO: make it configurable
                          }
                      }
                  }
              }
          },
          weight: 10 // Weight for documents where enable_percentage is < 100
      },
        ],
        score_mode: "sum", // Combine scores from all functions
        boost_mode: "replace" // Replace the final score with the score calculated by the functions
      }
    };

    // Define the aggregation query
    let aggr_query = {
      unique_providers: {
        composite: {
          size: searchRequest.limit,
          sources: [
            { provider_id: { terms: { field: "location_details.id" } } }
          ],
          after: searchRequest.afterKey ? { provider_id: searchRequest.afterKey } : undefined
        },
        aggs: {
          products: {
            top_hits: {
              size: 10,
            }
          }
        }
      },
      unique_provider_count: {
        cardinality: {
          field: "location_details.id"
        }
      }
    };

    // Perform the search query with the defined query and aggregation
    let queryResults = await client.search({
      body: {
        query: query_obj,
        aggs: aggr_query,
        size: 0,
      }
    });

    // Extract unique providers from the aggregation results
    let unique_providers = queryResults.aggregations.unique_providers.buckets.map(bucket => {
      let minDays = 0;
      if (searchRequest.pincode) {
        let docPincode = bucket.products.hits.hits[0]._source.location_details.address.area_code;
        let matchCount = 0;
        for (let i = 0; i < searchRequest.pincode.length; i++) {
          if (i < docPincode.length && searchRequest.pincode.charAt(i) == docPincode.charAt(i)) {
            matchCount++;
          } else {
            break;
          }
        }
        if (matchCount == 6) minDays = 15 * 60;
        else if (matchCount == 5) minDays = 30 * 60;
        else if (matchCount == 4) minDays = 45 * 60;
        else if (matchCount == 3) minDays = 60 * 60;
        else if (matchCount == 2) minDays = 1440 * 60;
        else if (matchCount == 1) minDays = 1440 * 60;
        else minDays = 10080 * 60; // other state
      }

      return {
        ...bucket.products.hits.hits[0]._source.provider_details,
        minDays,
        minDaysWithTTS: minDays + bucket.products.hits.hits[0]._source.location_details.median_time_to_ship,
        items: bucket.products.hits.hits.map((hit) => hit._source)
      };
    });

    // Get the unique provider count
    let totalCount = queryResults.aggregations.unique_provider_count.value;
    let totalPages = Math.ceil(totalCount / searchRequest.limit);

    // Get the after key for pagination
    let afterKey = queryResults.aggregations.unique_providers.after_key;

    // Return the response with count, data, afterKey, and pages
    return {
      response: {
        count: totalCount,
        data: unique_providers,
        afterKey: afterKey,
        pages: totalPages,
      }
    };

  } catch (err) {
    console.error("Error executing search query:", err);
    throw err;
  }
}


  async getProviders(searchRequest, targetLanguage = "en") {
    try {
      console.log("searchRequest", searchRequest)
      let query_obj = {
        bool: {
          must: [
            {
              match: {
                language: targetLanguage,
              },
              
            },
            {
              match: {
                "type": 'item',
              },
            },
            {
              match: {
                "item_details.time.label": 'enable',
              },
            },
            {
              terms: {
                "location_details.time.label": ['enable','open'],
              },
            },
            {
              match: {
                "provider_details.time.label": 'enable',
              },
            }
          ]
        }
      };

      let aggr_query = {
        unique_providers: {
          composite: {
            size: searchRequest.limit,
            sources: [
              { provider_id: { terms: { field: "provider_details.id" } } }
            ],
            after: searchRequest.afterKey ? { provider_id: searchRequest.afterKey } : undefined
          },
          aggs: {
            products: {
              top_hits: {
                size: 1,
              }
            }
          }
        },
        unique_provider_count: {
          cardinality: {
            field: "provider_details.id"
          }
        }
      };

      let queryResults = await client.search({
        body: {
          query: query_obj,
          aggs: aggr_query,
          size: 0
        }
      });

      let unique_providers = queryResults.aggregations.unique_providers.buckets.map(bucket => {
        return bucket.products.hits.hits[0]._source.provider_details;
      });

      let totalCount = queryResults.aggregations.unique_provider_count.value;
      let totalPages = Math.ceil(totalCount / searchRequest.limit);

      let afterKey = queryResults.aggregations.unique_providers.after_key;

      return {
        response: {
          count: totalCount,
          data: unique_providers,
          afterKey: afterKey,
          pages: totalPages
        }
      };

    } catch (err) {
      throw err;
    }
  }

  async getProviders1(indexName, pageSize, afterKey = null) {
    const body = {
      size: 0, // We don't need the actual documents, only the aggregation results
      aggs: {
        unique_provider_ids: {
          composite: {
            size: 20,
            sources: [
              { provider_id: { terms: { field: 'provider_details.id' } } }
            ]
          }
        }
      }
    };

    // If afterKey is provided, add it to the request body
    if (afterKey) {
      body.aggs.unique_provider_ids.after = afterKey;
    }

    const { body: response } = await client.search({
      body
    });

    return response.aggregations.unique_provider_ids;
  }

  async getCustomMenu(searchRequest, targetLanguage = "en") { //TODO: FIX pagination issue default to 100
    try {
      let matchQuery = [];

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      matchQuery.push({
        match: {
          "type": 'item',
        },
      })

      if (searchRequest.provider) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.provider,
          },
        });
      }

      let queryResults = await client.search({
        query: {
          bool: {
            must: [
              {
                term: {
                  "provider_details.id": searchRequest.provider,
                },
              },
            ],
          },
        },
        aggs: {
          unique_menus: {
            nested: {
              path: "customisation_menus",
            },
            aggs: {
              filtered_menus: {
                terms: {
                  field: "customisation_menus.id",
                },
                aggs: {
                  menu_details: {
                    top_hits: {
                      size: 1,
                    },
                  },
                },
              },
            },
          },
        },
      });

      let customisationMenus = [];
      const buckets =
        queryResults.aggregations.unique_menus.filtered_menus.buckets;

      buckets.forEach((bucket) => {
        const menuDetails = bucket.menu_details.hits.hits.map(
          (hit) => hit._source,
        )[0];
        customisationMenus.push(menuDetails);
      });
      console.log("Unique IDs with documents:", customisationMenus);
      return {
        data: customisationMenus,
        count: customisationMenus.length,
        pages: customisationMenus.length,
      };
    } catch (err) {
      throw err;
    }
  }

  async getOffers(searchRequest, targetLanguage = "en") {
    try {
      let matchQuery = [];
      let searchQuery = [];

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      searchQuery.push({
        match: {
          "location_details.type": "pan",
        },
      });

      if (searchRequest.latitude && searchRequest.longitude)
        searchQuery.push({
          geo_shape: {
            "location_details.polygons": {
              shape: {
                type: "point",
                coordinates: [
                  parseFloat(searchRequest.latitude),
                  parseFloat(searchRequest.longitude),
                ],
              },
            },
          },
        });

      if (searchRequest.provider) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.provider,
          },
        });
      }
      if (searchRequest.location) {
        matchQuery.push({
          match: {
            "location_details.id": searchRequest.location,
          },
        });
      }
      let queryResults = await client.search({
        index: 'offers',
        query: {
          bool: {
            must: matchQuery,
            should: searchQuery,
            minimum_should_match: 1
          },
        },
        size: 20
      });

      // Extract the _source field from each hit
      let sources = queryResults.hits.hits.map((hit) => {
        return { ...hit._source, provider: hit._source.provider_details.id, provider_descriptor: hit._source.provider_details.descriptor, location: hit._source.location_details.id, domain: hit._source.context.domain, id: hit._source.local_id };
      });

      // Get the total count of results
      let totalCount = queryResults.hits.total.value;

      // Return the total count and the sources
      return {
        response: {
          count: totalCount,
          data: sources,
        },
      };


    } catch (err) {
      throw err;
    }
  }
  async servieablelocations(searchRequest, targetLanguage = "en") {
    try {
        const page = searchRequest.page ? parseInt(searchRequest.page, 10) : 0;
        const limit = searchRequest.limit ? parseInt(searchRequest.limit, 10) : 10;

        if (isNaN(page) || page < 0) throw new Error("Invalid page number");
        if (isNaN(limit) || limit <= 0) throw new Error("Invalid limit");

        // Set the timezone to Asia/Kolkata (IST)
        const timezone = 'Asia/Kolkata';

        // Get the current time in the specified timezone
        const today = moment().tz(timezone);

        // Get the current day of the week (1 = Monday, ..., 7 = Sunday)
        const currentDay = today.day() === 0 ? 7 : today.day(); // Adjusting for Sunday

        // Get the current time in hours and minutes
        const hours = today.hours().toString().padStart(2, '0');
        const minutes = today.minutes().toString().padStart(2, '0');
        const currentTime = parseInt(hours + minutes, 10);

        console.log(`Current Day: ${currentDay}`);
        console.log(`Current Time: ${currentTime}`);
  

        let matchQuery = [];
        if (searchRequest.domain) {
            matchQuery.push({ match: { "context.domain": searchRequest.domain } });
        }
        matchQuery.push({
          match: {
            language: targetLanguage,
          },
        });
        matchQuery.push({
          terms: {
            "location_details.time.label": ['enable','open'],
          },
        });
        matchQuery.push({
          match: {
            "provider_details.time.label": 'enable',
          },
        });

        if(searchRequest.providerId){
          matchQuery.push({
            match: {
              "provider_details.id": searchRequest.providerId,
            },
          });
        }


        matchQuery.push({exists: { field: "location_details.address.area_code" } })

        let query_obj = {
          function_score: {
              query: {
                  bool: {
                      must: matchQuery,
                      should: [
                          {
                              geo_shape: {
                                  "location_details.polygons": {
                                      shape: {
                                          type: "point",
                                          coordinates: [
                                              parseFloat(searchRequest.latitude),
                                              parseFloat(searchRequest.longitude),
                                          ]
                                      }
                                  }
                              }
                          },
                          {
                              match: {
                                  "location_details.type": "pan",
                              }
                          }
                      ],
                      minimum_should_match: 1
                  }
              },
              functions: [
                {
                  filter: {
                      nested: {
                          path: `availability.${currentDay}`,
                          query: {
                              bool: {
                                  should: [
                                      {
                                          bool: {
                                              must: [
                                                  { range: { [`availability.${currentDay}.start`]: { lte: currentTime } } },
                                                  { range: { [`availability.${currentDay}.end`]: { gte: currentTime } } }
                                              ]
                                          }
                                      }
                                  ]
                              }
                          }
                      }
                  },
                  weight: 0 // Low weight for documents matching the filter
              },
              {
                filter: {
                    bool: {
                        must_not: {
                            range: {
                                "enable_percentage": {
                                    gte: 80 //TODO: make it configurable
                                }
                            }
                        }
                    }
                },
                weight: 10000000 // Weight for documents where enable_percentage is < 100
            },
            {
              filter: {
                  bool: {
                      must: {
                          range: {
                              "enable_percentage": {
                                  gte: 80 //TODO: make it configurable
                              }
                          }
                      }
                  }
              },
              weight: 0 // Weight for documents where enable_percentage is < 100
          },
              {
                filter: {
                    bool: {
                        must_not: {
                            nested: {
                                path: `availability.${currentDay}`,
                                query: {
                                    bool: {
                                        must: [
                                            { range: { [`availability.${currentDay}.start`]: { lte: currentTime } } },
                                            { range: { [`availability.${currentDay}.end`]: { gte: currentTime } } }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                weight: 10000000 // High weight for documents not matching the filter
            },
            
                  {
                      script_score: {
                          script: {
                              source: `
                                  String inputPincode = params.inputPincode;
                                  String docPincode = doc.containsKey('location_details.address.area_code') ? doc['location_details.address.area_code'].value : '';
                                  int matchCount = 0;
      
                                  for (int i = 0; i < inputPincode.length(); i++) {
                                      if (i < docPincode.length() && inputPincode.charAt(i) == docPincode.charAt(i)) {
                                          matchCount++;
                                      } else {
                                          break;
                                      }
                                  }
      
                                  int minDays;
                                  if (matchCount == 6) minDays = 15*60;
                                  else if (matchCount == 5) minDays = 30*60;
                                  else if (matchCount == 4) minDays = 45*60;
                                  else if (matchCount == 3) minDays = 60*60;
                                  else if (matchCount == 2) minDays = 1440*60;
                                  else if (matchCount == 1) minDays = 1440*60;
                                  else minDays = 10080*60;
      
                                  return (doc.containsKey('location_details.median_time_to_ship') ? doc['location_details.median_time_to_ship'].value + minDays : minDays);
                              `,
                              params: {
                                  inputPincode: searchRequest.pincode
                              }
                          }
                      }
                  }
              ],
              score_mode: "sum", // Combine scores from all functions
              boost_mode: "replace" // Replace the final score with the score calculated by the functions
          }
      };
      
      

        let queryResults = await client.search({
            index: 'locations',
            body: {
                query: query_obj,
                sort: [
                    { "_score": { "order": "asc" } }
                ],
                from: page * limit,
                size: limit
            }
        });

        let locations = queryResults.hits.hits.map(hit => {
            const source = hit._source || {};
            let docPincode = source.location_details.address.area_code;
            let matchCount = 0;
            for (let i = 0; i < searchRequest.pincode.length; i++) {
              if (i < docPincode.length && searchRequest.pincode.charAt(i) == docPincode.charAt(i)) {
                matchCount++;
              }else {
                break;
            }
            }

            let minDays;
            if (matchCount == 6) minDays = 15*60;
            else if (matchCount == 5) minDays = 30*60;
            else if (matchCount == 4) minDays = 45*60;
            else if (matchCount == 3) minDays = 60*60;
            else if (matchCount == 2) minDays = 1440*60;
            else if (matchCount == 1) minDays = 1440*60;
            else minDays = 10080*60; //other state

            return {
                minDays : minDays,
                minDaysWithTTS : minDays + source.location_details.median_time_to_ship,
                domain: source.context.domain,
                provider_descriptor:source.provider_details.descriptor,
                provider: source.provider_details.id,
                ...source.location_details,
                calculated_score: hit._score,
                availability:source.availability

            };
        }).filter(item => item !== null);

        let totalCount = queryResults.hits.total.value;
        let totalPages = Math.ceil(totalCount / limit);

        return {
            count: totalCount,
            data: locations,
            pages: totalPages
        };

    } catch (err) {
        console.error("Error executing search query:", err);
        throw err;
    }
}

}

export default SearchService;
