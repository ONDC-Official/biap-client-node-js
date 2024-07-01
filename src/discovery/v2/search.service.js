import _ from "lodash";
import { onSearch } from "../../utils/protocolApis/index.js";
import ContextFactory from "../../factories/ContextFactory.js";
import BppSearchService from "./bppSearch.service.js";
import { CITY_CODE } from "../../utils/cityCode.js";
import createPeriod from "date-period";
import translateObject from "../../utils/bhashini/translate.js";
import { OBJECT_TYPE } from "../../utils/constants.js";
// import logger from "../lib/logger";
const bppSearchService = new BppSearchService();
import client from "../../database/elasticSearch.js";

class SearchService {
  isBppFilterSpecified(context = {}) {
    return typeof context.bpp_id !== "undefined";
  }

  async search(searchRequest = {}, targetLanguage = "en") {
    try {
      // providerIds=ondc-mock-server-dev.thewitslab.com_ONDC:RET10_ondc-mock-server-dev.thewitslab.com
      let matchQuery = [];

      // bhashini translated data
      matchQuery.push({
        match: {
          language: targetLanguage,
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

      if (searchRequest.categoryIds) {
        matchQuery.push({
          match: {
            "item_details.category_id": searchRequest.categoryIds,
          },
        });
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
        },
        // "should": [ //TODO: enable this once UI apis have been changed
        //     {
        //         "match": {
        //             "location_details.type.keyword": "pan"
        //         }
        //     },
        //     {
        //         "geo_shape": {
        //             "location_details.polygons": {
        //                 "shape": {
        //                     "type": "point",
        //                     "coordinates": [lat, lng]
        //                 }
        //             }
        //         }
        //     }
        // ]
      };

      // Calculate the starting point for the search
      let size = parseInt(searchRequest.limit);
      let page = parseInt(searchRequest.pageNumber);
      const from = (page - 1) * size;

      // Perform the search with pagination parameters
      let queryResults = await client.search({
        query: query_obj,
        from: from,
        size: size,
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
          pages: parseInt(totalCount / size),
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async globalSearchItems(searchRequest = {}, targetLanguage = "en") {
    try {
      // providerIds=ondc-mock-server-dev.thewitslab.com_ONDC:RET10_ondc-mock-server-dev.thewitslab.com
      let matchQuery = [];
      let searchQuery = [];

      // bhashini translated data
      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      if (searchRequest.name) {
        matchQuery.push({
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

      // for variants we set is_first = true
      matchQuery.push({
        match: {
          is_first: true,
        },
      });

      searchQuery.push({
        match: {
          "location_details.type.keyword": "pan",
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

      let query_obj = {
        bool: {
          must: matchQuery,
          should: searchQuery,
        },
      };

      // Calculate the starting point for the search
      let size = parseInt(searchRequest.limit);
      let page = parseInt(searchRequest.pageNumber);
      const from = (page - 1) * size;

      console.log(query_obj);
      // Perform the search with pagination parameters
      let queryResults = await client.search({
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
      });

      // Extract the _source field from each hit
      let sources = queryResults.hits.hits.map((hit) => hit._source);

      // Get the total count of results
      let totalCount = queryResults.hits.total.value;

      // Return the total count and the sources
      return {
          count: totalCount,
          data: sources,
          pages: parseInt(Math.round(totalCount / size)),
      };
    } catch (err) {
      throw err;
    }
  }

  async getItems(searchRequest = {}, targetLanguage = "en") {
    try {
      let matchQuery = [];

      // bhashini translated data
      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

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

      // Perform the search with pagination parameters
      let queryResults = await client.search({
        body: {
          query: query_obj,
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
        location_details = {
          domain: details.context.domain,
          provider_descriptor: details.provider_details.descriptor,
          ...details.location_details,
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

          let query_obj = {
            bool: {
              must: matchQuery,
            },
          };

          let queryResults = await client.search({
            query: query_obj,
          });

          item_details.related_items = queryResults.hits.hits.map(
            (hit) => hit._source,
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
          // Create the query object
          let query_obj = {
            bool: {
              must: customisationQuery,
            },
          };

          let queryResults = await client.search({
            query: query_obj,
          });

          console.log(queryResults);
          item_details.customisation_items = queryResults.hits.hits.map(
            (hit) => hit._source,
          );
        }
      }

      item_details.locations = [item_details.location_details]
      //            console.log("itemdetails--->",item_details)
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

      if (searchRequest.provider) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.provider,
          },
        });
      }

      const response = await client.search({
        size: 0, // We don't need the actual documents, just the aggregation results
        body: {
          query: {
            bool: {
              must: matchQuery,
            },
          },
          aggs: {
            unique_keys: {
              scripted_metric: {
                init_script: "state.keys = new HashSet();",
                map_script: `
              for (entry in params._source.attributes.entrySet()) {
                state.keys.add(entry.getKey());
              }
            `,
                combine_script: "return state.keys;",
                reduce_script: `
              Set uniqueKeys = new HashSet();
              for (state in states) {
                uniqueKeys.addAll(state);
              }
              return uniqueKeys;
            `,
              },
            },
          },
        },
      });

      // Extract the unique keys from the aggregation results
      const uniqueKeys = Array.from(response.aggregations.unique_keys.value);

      const keyObjects = uniqueKeys.map((key) => ({ code: key }));
      return { response: { data: keyObjects, count: 1, pages: 1 } };
    } catch (err) {
      throw err;
    }
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

      if (searchRequest.provider) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.provider,
          },
        });
      }

      const response = await client.search({
        body: {
          query: {
            bool: {
              must: matchQuery,
            },
          },
          size: 0,
          aggs: {
            unique_values: {
              terms: {
                field: `attributes.${searchRequest.attribute_code}.keyword`, // Aggregation by 'Color' attribute
                //          size: 10 // Adjust 'size' based on how many unique values you expect
              },
            },
          },
        },
      });
      console.log(response);

      const uniqueValues = response.aggregations.unique_values.buckets.map(
        (bucket) => bucket.key,
      );
      //    console.log(body.hits.hits); // Print the matching documents
      // Extract and return the hits (documents)
      return { response: { data: uniqueValues, count: uniqueValues.length } }; //.body.hits.hits;
    } catch (err) {
      throw err;
    }
  }

  async getLocations1(searchRequest, targetLanguage = "en") {
    try {

     let matchQuery = []

     if(searchRequest.domain){
      matchQuery.push(            {
                                    match: {
                                      "context.domain": searchRequest.domain,
                                    },
                                  },)
     }
      let query_obj = {
        bool: {
          must: matchQuery,
          should: [
            //TODO: enable this once UI apis have been changed
            {
              match: {
                "location_details.type.keyword": "pan",
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
      };

      let aggr_query = {
        unique_locations: {
          terms: {
            field: "location_details.id",
          },
          aggs: {
            products: {
              top_hits: {
                size: 1,
              },
            },
          },
        },
      };

      // Calculate the starting point for the search
      let size = parseInt(searchRequest.limit);
      let page = parseInt(searchRequest.pageNumber);
      const from = (page - 1) * size;

      // Perform the search with pagination parameters
      let queryResults = await client.search({
        query: query_obj,
        aggs: aggr_query,
      });

      console.log("queryResults--->", queryResults);

      let unique_locations = [];

      for (const bucket of queryResults.aggregations.unique_locations.buckets) {
        const details = bucket.products.hits.hits.map((hit) => hit._source)[0];
        unique_locations.push({
          domain: details.context.domain,
          provider_descriptor: details.provider_details.descriptor,
          provider: details.provider_details.id,
          ...details.location_details,
        });
      }

      // Get the total count of results
      let totalCount = queryResults.hits.total.value;

      // Return the total count and the sources
      return {
        count: totalCount,
        data: unique_locations,
        pages: parseInt(totalCount / 1),
      };

      // return unique_providers
      //            return unique_locations;
    } catch (err) {
      throw err;
    }
  }


  async getLocations(searchRequest, targetLanguage = "en") {
    try {

     let matchQuery = []

     if(searchRequest.domain){
      matchQuery.push(            {
                                    match: {
                                      "context.domain": searchRequest.domain,
                                    },
                                  },)
     }

     //default language search
     matchQuery.push(            {
      match: {
        language: targetLanguage,
      },
    },)

      let query_obj = {
        bool: {
          must: matchQuery,
          should: [
            //TODO: enable this once UI apis have been changed
            {
              match: {
                "location_details.type.keyword": "pan",
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
      };

      //   bool: {
      //     must: [
      //       {
      //         bool: {
      //           should: [
      //             {
      //               match: {
      //                 "item_details.descriptor.name": {
      //                   query: searchRequest.name,
      //                   fuzziness: "AUTO",
      //                   operator: "or", // Match any words in the query
      //                   boost: 2 // Boosting relevance score for name matches
      //                 }
      //               }
      //             },
      //             {
      //               match: {
      //                 "provider_details.descriptor.name": {
      //                   query: searchRequest.name,
      //                   fuzziness: "AUTO",
      //                   operator: "or",
      //                   boost: 2
      //                 }
      //               }
      //             },
      //             {
      //               match_phrase_prefix: { // Match prefix for better relevance
      //                 "item_details.descriptor.name": {
      //                   query: searchRequest.name,
      //                   max_expansions: 10,
      //                   boost: 1.5
      //                 }
      //               }
      //             },
      //             {
      //               match_phrase_prefix: {
      //                 "provider_details.descriptor.name": {
      //                   query: searchRequest.name,
      //                   max_expansions: 10,
      //                   boost: 1.5
      //                 }
      //               }
      //             }
      //           ]
      //         }
      //       },
      //       {
      //         match: {
      //           "location_details.type.keyword": "pan",
      //         },
      //       },
      //       {
      //         geo_shape: {
      //           "location_details.polygons": {
      //             shape: {
      //               type: "point",
      //               coordinates: [
      //                 parseFloat(searchRequest.latitude),
      //                 parseFloat(searchRequest.longitude),
      //               ],
      //             },
      //           },
      //         },
      //       },
      //     ],
      //   },
      // };
  
      // let query_obj = {bool:{}}
      // Define the aggregation query
      let aggr_query = {
        unique_location: {
          composite: {
            size: searchRequest.limit,
            sources: [
              { location_id: { terms: { field: "location_details.id" } } }
            ],
            after: searchRequest.afterKey ? { location_id: searchRequest.afterKey } : undefined
          },
          aggs: {
            products: {
              top_hits: {
                size: 1,
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
  
      // Perform the search query with the defined query and aggregation
      let queryResults = await client.search({
        body: {
          query: query_obj,
          aggs: aggr_query,
          size: 0
        }
      });
  
      // Extract unique providers from the aggregation results
      let unique_location = queryResults.aggregations.unique_location.buckets.map(bucket => {

        const details = bucket.products.hits.hits.map((hit) => hit._source)[0];
        return ({
          domain: details.context.domain,
          provider_descriptor: details.provider_details.descriptor,
          provider: details.provider_details.id,
          ...details.location_details,
        });

        // return {...bucket.products.hits.hits[0]._source.location_details};
      });
  
      // Get the unique provider count
      let totalCount = queryResults.aggregations.unique_location_count.value;
      let totalPages = Math.ceil(totalCount / searchRequest.limit);
  
      // Get the after key for pagination
      let afterKey = queryResults.aggregations.unique_location.after_key;
  
      // Return the response with count, data, afterKey, and pages
      return {
          count: totalCount,
          data: unique_location,
          afterKey: afterKey,
          pages: totalPages,
      };
  
    } catch (err) {
      throw err;
    }
  }

  async getGlobalProviders(searchRequest, targetLanguage = "en") {
    try {
      console.log("searchRequest", searchRequest);
  
      // Define the query object with additional filters on names
      let query_obj = {
        bool: {
          must: [
            {
              bool: {
                should: [
                  {
                    regexp: {
                      "item_details.descriptor.name": {
                        value: `.*${searchRequest.name}.*`,
                        case_insensitive: true,
                      },
                    },
                  },
                  {
                    regexp: {
                      "provider_details.descriptor.name": {
                        value: `.*${searchRequest.name}.*`,
                        case_insensitive: true,
                      },
                    },
                  },
                ],
              },
            },
                 //default language search
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
                      "location_details.type.keyword": "pan",
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
      };
      
      // let query_obj = {
      //   bool: {
      //     must: [
      //       {
      //         bool: {
      //           should: [
      //             {
      //               match: {
      //                 "item_details.descriptor.name": {
      //                   query: searchRequest.name,
      //                   fuzziness: "AUTO",
      //                   operator: "or", // Match any words in the query
      //                   boost: 2 // Boosting relevance score for name matches
      //                 }
      //               }
      //             },
      //             {
      //               match: {
      //                 "provider_details.descriptor.name": {
      //                   query: searchRequest.name,
      //                   fuzziness: "AUTO",
      //                   operator: "or",
      //                   boost: 2
      //                 }
      //               }
      //             },
      //             {
      //               match_phrase_prefix: { // Match prefix for better relevance
      //                 "item_details.descriptor.name": {
      //                   query: searchRequest.name,
      //                   max_expansions: 10,
      //                   boost: 1.5
      //                 }
      //               }
      //             },
      //             {
      //               match_phrase_prefix: {
      //                 "provider_details.descriptor.name": {
      //                   query: searchRequest.name,
      //                   max_expansions: 10,
      //                   boost: 1.5
      //                 }
      //               }
      //             }
      //           ]
      //         }
      //       },
      //       {
      //         match: {
      //           "location_details.type.keyword": "pan",
      //         },
      //       },
      //       {
      //         geo_shape: {
      //           "location_details.polygons": {
      //             shape: {
      //               type: "point",
      //               coordinates: [
      //                 parseFloat(searchRequest.latitude),
      //                 parseFloat(searchRequest.longitude),
      //               ],
      //             },
      //           },
      //         },
      //       },
      //     ],
      //   },
      // };
  
      // let query_obj = {bool:{}}
      // Define the aggregation query
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
  
      // Perform the search query with the defined query and aggregation
      let queryResults = await client.search({
        body: {
          query: query_obj,
          aggs: aggr_query,
          size: 0
        }
      });
  
      // Extract unique providers from the aggregation results
      let unique_providers = queryResults.aggregations.unique_providers.buckets.map(bucket => {
        return {...bucket.products.hits.hits[0]._source.provider_details,items:bucket.products.hits.hits.map((hit) => hit._source)};
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
      throw err;
    }
  }

  async getProviders(searchRequest, targetLanguage = "en") {
    try {
      console.log("searchRequest",searchRequest)
      let query_obj = {
        bool: {
          // Add your actual query conditions here
        }
      };
  
      let aggr_query = {
        unique_providers: {
          composite: {
            size: searchRequest.limit,
            sources: [
              { provider_id: { terms: { field: "provider_details.id" } } }
            ],
            after: searchRequest.afterKey?{provider_id:searchRequest.afterKey}:undefined
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

  async getCustomMenu(searchRequest, targetLanguage = "en") {
    try {
      let matchQuery = [];

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

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

  async  getOffers(searchRequest, targetLanguage = "en") {
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
          "location_details.type.keyword": "pan",
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
        index:'offers',
        query: {
          bool: {
            must:matchQuery,
            should:searchQuery
          },
        },
        size:20
      });

      // Extract the _source field from each hit
      let sources = queryResults.hits.hits.map((hit) => {
        return {...hit._source,provider:hit._source.provider_details.id,provider_descriptor:hit._source.provider_details.descriptor,location:hit._source.location_details.id,domain:hit._source.context.domain,id:hit._source.local_id};
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

}

export default SearchService;
