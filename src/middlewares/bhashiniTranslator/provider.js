import axios from "axios";

export const providerTranslator = async (req, res, next) => {
  // try {
  //   const { page } = req.query; // Extract page number from query parameter
  //   let lang
  //   if(req.query.lang){
  //     lang = req.query.lang
  //   }
  //   else{
  //     res.status(200).json({ data: req.body.responseData });
  //   }
  //   let responseData = req.body.responseData;
  //   const itemsPerPage = 10;
  //   const startIndex = (page - 1) * itemsPerPage;
  //   const itemsToTranslate = responseData.response.data.map(item => ({
  //       itemName: item.descriptor.name
  //   }));
  //   console.log("itemtotranslate----->", itemsToTranslate);
    
  //   // console.log("item---->",itemsToTranslate)


  //   // Extract values for translation
  //   const valuesToTranslate = itemsToTranslate.flatMap(item => [item.itemName]);


  //   let data = {
  //     "pipelineTasks": [{
  //       "taskType": "translation",
  //       "config": {
  //         "language": {
  //           "sourceLanguage": "en",
  //           "targetLanguage": lang
  //         },
  //         "serviceId": "ai4bharat/indictrans-v2-all-gpu--t4"
  //       }
  //     }],
  //     "inputData": {
  //       "input": [{
  //         "source": JSON.stringify(valuesToTranslate)
  //       }]
  //     }
  //   };

  //   let config = {
  //     method: 'post',
  //     url: 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline',
  //     headers: {
  //       'Authorization': '5bcJyckKIeDJXW9x_C9gs7P7Rt1goop7SmPyrrdKHF5_4XrWrtMCJaVL8RO8hEJ8',
  //       'Content-Type': 'application/json'
  //     },
  //     data: JSON.stringify(data)
  //   };

  //   return axios.request(config)
  //     .then((response) => {
  //       console.log("bhashini success12344", (response.data.pipelineResponse[0].output[0].target));
  //       let translatedValues = response.data.pipelineResponse[0].output[0].target.split(",").map( item => item.split('"')[1] )
  //       responseData = responseData.response.data.map( (item, index) => {
  //         item.descriptor.name = translatedValues[index];
  //         return item;
  //       })
  //       return res.status(200).json({ data: responseData });
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //       throw error;
  //     });
  // } catch (error) {
  //   console.error("Error:", error);
  //   return res.status(500).json({ message: "Internal Server Error" });
  // }
  return res.status(200).json({ ...req.body.responseData });

};










