import axios from "axios";

const bhashiniPipelineURL = 'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline'
const bhashiniTranslateURL = 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline'

async function translate(data) {

    try {

        console.log("translate text--->",data)
        //check if data present in cache? if yes return else translate
        let cacheTranslation = await redisCache.get(`${data.text}_${data.source_language}_${data.target_language}`)
        if(cacheTranslation){
            console.log("translation found in cache",cacheTranslation)
            return cacheTranslation
        }else{

            //create a pipeline
            let pipelinedata = JSON.stringify({
                "pipelineTasks": [
                    {
                        "taskType": "translation",
                        "config": {
                            "language": {
                                "sourceLanguage": `${data.source_language}`,
                                "targetLanguage": `${data.target_language}`
                            }
                        }
                    },
                    {
                        "taskType": "tts",
                        "config": {
                            "language": {
                                "sourceLanguage": `${data.target_language}`
                            }
                        }
                    }
                ],
                "pipelineRequestConfig": {
                    "pipelineId": "64392f96daac500b55c543cd"
                }
            });

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: bhashiniPipelineURL,
                headers: {
                    'userID': process.env.BHASHINI_USERID,
                    'ulcaApiKey': process.env.BHASHINI_ULCA_API_KEY,
                    'Content-Type': 'application/json'
                },
                data : pipelinedata
            };

            let pipeline =  await axios.request(config)

            var jsonRes=pipeline.data

            /********************prepare object for translation***************************/
            const callback_url = jsonRes.pipelineInferenceAPIEndPoint.callbackUrl;
            const callback_url_feedback = jsonRes.feedbackUrl;
            const compute_call_authorization_key = jsonRes.pipelineInferenceAPIEndPoint.inferenceApiKey.name;
            const compute_call_authorization_value = jsonRes.pipelineInferenceAPIEndPoint.inferenceApiKey.value;
            let asr_service_id ='';
            let nmt_service_id ='';
            let tts_service_id ='';

            const pipelineResponseConfig=jsonRes.pipelineResponseConfig;
            for(let eachResp of pipelineResponseConfig){
                if(eachResp.taskType=='asr'){
                    asr_service_id = eachResp.config[0].serviceId;
                }
                else if(eachResp.taskType=='translation'){
                    nmt_service_id= eachResp.config[0].serviceId;

                }
                else if(eachResp.taskType=='tts'){
                    tts_service_id=eachResp.config[0].serviceId;
                }
            }

            let translationData = JSON.stringify({
                "pipelineTasks": [
                    {
                        "taskType": "translation",
                        "config": {
                            "language": {
                                "sourceLanguage": `${data.source_language}`,
                                "targetLanguage": `${data.target_language}`
                            },
                            "serviceId": nmt_service_id
                        }
                    }
                ],
                "inputData": {
                    "input": [
                        {
                            "source": data.text
                        }
                    ]
                }
            });


            let headers = {
                'Accept': ' */*',
                'User-Agent': ' Thunder Client (https://www.thunderclient.com)',
                'Content-Type': 'application/json'
            }
            headers[compute_call_authorization_key]=`${compute_call_authorization_value}`;

            let translateConfig = {
                method: 'post',
                maxBodyLength: Infinity,
                url: bhashiniTranslateURL,
                headers,
                data : translationData
            };

            const translation  = await axios.request(translateConfig)
            let translatedText = ''
            if(translation.data){
                if(translation.data.pipelineResponse.length > 0){
                    console.log(translation.data.pipelineResponse.length)
                    if(translation.data.pipelineResponse[0].output.length > 0){
                        translatedText = translation.data.pipelineResponse[0].output[0].target
                    }
                }
            }
            if(translatedText){
                //set translated text in redis cache
                await redisCache.set(`${data.text}_${data.source_language}_${data.target_language}`,translatedText)

                return translatedText
            }else{
                return data.text //return original text if no translation found
            }
        }

    } catch (err) {
        console.log(err);
        return err;
    }
};


export default translate


