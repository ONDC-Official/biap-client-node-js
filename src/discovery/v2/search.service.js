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

  async getLocations(searchRequest, targetLanguage = "en") {
    try {
      let query_obj = {
        bool: {
          must: [
            {
              match: {
                "context.domain": searchRequest.domain,
              },
            },
          ],
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
      // for bucket in resp['aggregations']['unique_providers']['buckets']:
      // provider_details = [i["_source"]['provider_details'] for i in bucket['products']['hits']['hits']][0]
      // unique_providers.append(provider_details)

      for (const bucket of queryResults.aggregations.unique_locations.buckets) {
        const details = bucket.products.hits.hits.map((hit) => hit._source)[0];
        //                unique_locations.push({domain:details.context.domain,provider_descriptor:details.provider_details.descriptor,...details.location_details});
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

  async getProviders(searchRequest, targetLanguage = "en") {
    try {
      let query_obj = {
        bool: {
          //                    "must": [
          //                        {
          //                            "match": {
          //                                "context.domain": searchRequest.domain
          //                            }
          //                        }
          //                    ],
          //                    "should": [ //TODO: enable this once UI apis have been changed
          //                        {
          //                            "match": {
          //                                "location_details.type.keyword": "pan"
          //                            }
          //                        },
          //                        {
          //                            "geo_shape": {
          //                                "location_details.polygons": {
          //                                    "shape": {
          //                                        "type": "point",
          //                                        "coordinates": [parseFloat(searchRequest.latitude), parseFloat(searchRequest.longitude)]
          //                                    }
          //                                }
          //                            }
          //                        }
          //                    ]
        },
      };

      let aggr_query = {
        unique_providers: {
          terms: {
            field: "provider_details.id",
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

      let unique_providers = [];
      // for bucket in resp['aggregations']['unique_providers']['buckets']:
      // provider_details = [i["_source"]['provider_details'] for i in bucket['products']['hits']['hits']][0]
      // unique_providers.append(provider_details)

      for (const bucket of queryResults.aggregations.unique_providers.buckets) {
        const providerDetails = bucket.products.hits.hits.map(
          (hit) => hit._source.provider_details,
        )[0];
        unique_providers.push(providerDetails);
      }

      // Get the total count of results
      let totalCount = queryResults.hits.total.value;

      // Return the total count and the sources
      return {
        response: {
          count: totalCount,
          data: unique_providers,
          pages: parseInt(totalCount / 1),
        },
      };

      //
      //            // return unique_providers
      //            return unique_providers;
    } catch (err) {
      throw err;
    }
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
}

export default SearchService;
