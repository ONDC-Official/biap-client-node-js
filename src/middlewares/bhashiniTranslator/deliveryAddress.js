import axios from "axios";

export const bhashiniTranslator = async (req, res, next) => {
  try {
    let lang;
    if (!req.query.lang || req.query.lang === "en") {
      return res.status(200).json(req.body.responseData);
    } else {
      lang = req.query.lang;
    }
    let responseData = req.body.responseData;
    let index=0;
    const translateItem = async (item) => {

      const valuesToTranslate = [
        item?.descriptor?.name,
        item?.address?.door,
        item?.address?.street,
        item?.address?.city,
        item?.address?.state,
        item?.address?.country,
        item?.address?.tag
      ];

      console.error("valuesToTranslate",index++, valuesToTranslate);

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
console.log('JSON.stringify(valuesToTranslate)',JSON.stringify(valuesToTranslate),'  data: JSON.stringify(data)', JSON.stringify(data))
      try {
        const response = await axios.request(config);
        let translatedValues =
          response.data.pipelineResponse[0].output[0].target
            .split(",")
            .map((item) => item.split('"')[1]);

        console.log(
          "response.data.pipelineResponse[0].output[0].target",
          response.data.pipelineResponse[0].output[0].target,
          "translatedValues",
          translatedValues
        );

        let transIndex = 0;
        item.descriptor.name = translatedValues[transIndex++];
        item.address.door = translatedValues[transIndex++];
        item.address.street = translatedValues[transIndex++];
        item.address.city = translatedValues[transIndex++];
        item.address.state = translatedValues[transIndex++];
        item.address.country = translatedValues[transIndex++];
        item.address.tag = translatedValues[transIndex++];

        return item;
      } catch (error) {
        console.error("Error in translating item:", error);
        return item;
      }
    };
    let translatedOrders = [];
    for (const order of responseData) {
      const translatedItem = await translateItem(order);
      translatedOrders.push(translatedItem);
    }

    responseData = translatedOrders;
    return res.status(200).json(responseData);

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
