import axios from "axios";

export const cartTranslator = async (req, res, next) => {
  try {
    let lang

    if(!req.query.lang  || req.query.lang==="en"){
      return res.status(200).json(req.body.responseData );

    }
    else{
      lang = req.query.lang

    }
    let responseData = req.body.responseData;
    
    const itemsToTranslate = responseData.map((entity) => ({
      itemName: entity.item.product.descriptor.name.replace(/,/g, ''),
    }));
  

    const valuesToTranslate = itemsToTranslate.flatMap((item) => [
      item.itemName,
    ]);

    let data = {
      pipelineTasks: [
        {
          taskType: "translation",
          config: {
            language: {
              sourceLanguage: "en",
              targetLanguage: lang,
            },
            serviceId: "ai4bharat/indictrans-v2-all-gpu--t4",
          },
        },
      ],
      inputData: {
        input: [
          {
            source: JSON.stringify(valuesToTranslate),
          },
        ],
      },
    };

    let config = {
      method: "post",
      url: "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
      headers: {
        Authorization:
          "5bcJyckKIeDJXW9x_C9gs7P7Rt1goop7SmPyrrdKHF5_4XrWrtMCJaVL8RO8hEJ8",
        "Content-Type": "application/json",
      },
      data: JSON.stringify(data),
    };

    return axios
    .request(config)
    .then((response) => {
      let translatedValues = response.data.pipelineResponse[0].output[0].target.split(", ").map((item, index, array) => {
        if (index === 0) {
          return item.slice(1);
        } else if (index === array.length - 1) {
          return item.slice(0, -1);
        } else {
          return item;
        }
      });
  
      responseData = responseData.map((entity, index) => {
        entity.item.product.descriptor.name = translatedValues[index];
        return entity;
      });
     
      // Return responseData without stringifying
      return res.status(200).json(responseData);
    })
    .catch((error) => {
      console.error("Error:", error);
      // throw error;
    });
  
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
