import axios from "axios";

export const cartTranslator = async (req, res, next) => {
  try {
    let lang

    if(req.query.lang){
      lang = req.query.lang
    }
    else{
      res.status(200).json({ data: req.body.responseData });
    }
    let responseData = req.body.responseData;
    // console.log("responseData---->", JSON.stringify(responseData));
    
    const itemsToTranslate = responseData.map((entity) => ({
      itemName: entity.item.product.descriptor.name.replace(/,/g, ''),
    }));
    console.log(`itemtotranslate----->`, itemsToTranslate);

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
        console.log(
          "bhashini success12344",
          response.data.pipelineResponse[0].output[0].target
        );
        // let translatedValues =
        // response.data.pipelineResponse[0].output[0].target.split(", ");
          let translatedValues =
    response.data.pipelineResponse[0].output[0].target.split(", ").map((item, index, array) => {
        if (index === 0) {
            return item.slice(1);
        } else if (index === array.length - 1) {
            return item.slice(0, -1);
        } else {
            return item;
        }
    });
console.log("72>>>>",translatedValues)
        //  translatedValues = [आम, रागी और चावल अनाज, आम, रागी और चावल अनाज, आम, रागी और चावल अनाज, आम, रागी और चावल अनाज, आम, रागी और चावल अनाज, आम, रागी और चावल अनाज, आम, रागी और चावल अनाज]
        responseData = responseData.map((entity, index) => {
          console.log("76>>>>>>", translatedValues[index]);
          entity.item.product.descriptor.name = translatedValues[index]
          return entity;
        });

        return res.status(200).json(responseData);
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
