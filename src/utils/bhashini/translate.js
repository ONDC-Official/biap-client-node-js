import translate from './bhashini.js'
import {OBJECT_TYPE} from "../constants.js";

//Translate object keys based on object type

 async function translateObject(objectData,type,targetLanguage) {

    try {

        console.log({targetLanguage})
        let translatedItems = []
        //TODO: find a better object mapper instead of looping
        if(type===OBJECT_TYPE.PROVIDER){
            let data = objectData.response.data;
            console.log(data)
            if(data.length>0){
                for(let items of data){
                    items.descriptor.name =  await translate({text:items.descriptor.name,source_language:'en',target_language:targetLanguage})
                    items.descriptor.short_desc =  await translate({text:items.descriptor.short_desc,source_language:'en',target_language:targetLanguage})
                    items.descriptor.long_desc =  await translate({text:items.descriptor.long_desc,source_language:'en',target_language:targetLanguage})
                    translatedItems.push(items);
                }
            }
            return {response:{data:translatedItems,count:objectData.response.count,pages:objectData.response.count}};
        }else if(type===OBJECT_TYPE.ITEM || type===OBJECT_TYPE.CUSTOMMENU_ITEMS){
            let data = objectData.response.data;
            console.log(data)
            if(data.length>0){
                for(let items of data){
                    //items details
                    items.item_details.descriptor.name =  await translate({text:items.item_details.descriptor.name,source_language:'en',target_language:targetLanguage})
                    items.item_details.descriptor.short_desc =  await translate({text:items.item_details.descriptor.short_desc,source_language:'en',target_language:targetLanguage})
                    items.item_details.descriptor.long_desc =  await translate({text:items.item_details.descriptor.long_desc,source_language:'en',target_language:targetLanguage})

                    //provider details
                    items.provider_details.descriptor.name =  await translate({text:items.provider_details.descriptor.name,source_language:'en',target_language:targetLanguage})
                    items.provider_details.descriptor.short_desc =  await translate({text:items.provider_details.descriptor.short_desc,source_language:'en',target_language:targetLanguage})
                    items.provider_details.descriptor.long_desc =  await translate({text:items.provider_details.descriptor.long_desc,source_language:'en',target_language:targetLanguage})

                    translatedItems.push(items);
                }
            }
            return {response:{data:translatedItems,count:objectData.response.count,pages:objectData.response.count}};
        }else if(type===OBJECT_TYPE.LOCATIONS){
            let data = objectData.response.data;
            console.log(data)
            if(data.length>0){
                for(let items of data){
                    //items details
                    items.provider_descriptor.name =  await translate({text:items.provider_descriptor.name,source_language:'en',target_language:targetLanguage})
                    items.provider_descriptor.short_desc =  await translate({text:items.provider_descriptor.short_desc,source_language:'en',target_language:targetLanguage})
                    items.provider_descriptor.long_desc =  await translate({text:items.provider_descriptor.long_desc,source_language:'en',target_language:targetLanguage})

                    translatedItems.push(items);
                }
            }
            return {response:{data:translatedItems,count:objectData.response.count,pages:objectData.response.count}};
        }else if(type===OBJECT_TYPE.PROVIDER_DETAILS){
            let items = objectData.response;
            if(items){
                    //items details
                    items.descriptor.name =  await translate({text:items.descriptor.name,source_language:'en',target_language:targetLanguage})
                    items.descriptor.short_desc =  await translate({text:items.descriptor.short_desc,source_language:'en',target_language:targetLanguage})
                    items.descriptor.long_desc =  await translate({text:items.descriptor.long_desc,source_language:'en',target_language:targetLanguage})

                }

            return {response:items}
        } else if(type===OBJECT_TYPE.LOCATION_DETAILS){
            let items = objectData.response;
            if(items){
                    //items details
                    items.provider_descriptor.name =  await translate({text:items.provider_descriptor.name,source_language:'en',target_language:targetLanguage})
                    items.provider_descriptor.short_desc =  await translate({text:items.provider_descriptor.short_desc,source_language:'en',target_language:targetLanguage})
                    items.provider_descriptor.long_desc =  await translate({text:items.provider_descriptor.long_desc,source_language:'en',target_language:targetLanguage})

                }

            return {response:items}
        } else if(type===OBJECT_TYPE.ITEM_DETAILS){
            let items = objectData.response;
            if(items){
                items.item_details.descriptor.name =  await translate({text:items.item_details.descriptor.name,source_language:'en',target_language:targetLanguage})
                items.item_details.descriptor.short_desc =  await translate({text:items.item_details.descriptor.short_desc,source_language:'en',target_language:targetLanguage})
                items.item_details.descriptor.long_desc =  await translate({text:items.item_details.descriptor.long_desc,source_language:'en',target_language:targetLanguage})

                //provider details
                items.provider_details.descriptor.name =  await translate({text:items.provider_details.descriptor.name,source_language:'en',target_language:targetLanguage})
                items.provider_details.descriptor.short_desc =  await translate({text:items.provider_details.descriptor.short_desc,source_language:'en',target_language:targetLanguage})
                items.provider_details.descriptor.long_desc =  await translate({text:items.provider_details.descriptor.long_desc,source_language:'en',target_language:targetLanguage})

                }

            return {response:items}
        }

    } catch (err) {
        console.log(err)
        return err;
    }
};

export default translateObject


