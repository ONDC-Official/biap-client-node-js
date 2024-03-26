import axios from "axios";

export const bhashiniTranslator = async (req, res, next) => {
  try {
    let lang;
    if (!req.query.lang || req.query.lang === "en") {
      return res.status(200).json(req.body.responseData);
    } else {
      lang = req.query.lang;
    }
    // console.error("bhashiniTranslator", lang);

    let responseData = req.body.responseData;
    // let index=0;

    const translateItem = async (item) => {

      const valuesToTranslate = [
        item?.provider?.descriptor?.name,
        item?.billing?.address?.locality,
        item?.billing?.address?.city,
        item?.billing?.address?.state,
        item?.billing?.address?.country,
        item?.billing?.address?.building,
        item?.items[0]?.product?.descriptor?.name,
      ];

      // console.error("valuesToTranslate",index++, valuesToTranslate);

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

      try {
        const response = await axios.request(config);
        let translatedValues =
          response.data.pipelineResponse[0].output[0].target
            .split(",")
            .map((item) => item.split('"')[1]);

        // console.log(
        //   "response.data.pipelineResponse[0].output[0].target",
        //   response.data.pipelineResponse[0].output[0].target,
        //   "translatedValues",
        //   translatedValues
        // );

        let transIndex = 0;
        item.provider.descriptor.name = translatedValues[transIndex++];
        item.billing.address.locality = translatedValues[transIndex++];
        item.billing.address.city = translatedValues[transIndex++];
        item.billing.address.state = translatedValues[transIndex++];
        item.billing.address.country = translatedValues[transIndex++];
        item.billing.address.building = translatedValues[transIndex++];
        item.items[0].product.descriptor.name = translatedValues[transIndex++];

        return item;
      } catch (error) {
        console.error("Error in translating item:", error);
        return item;
      }
    };

    let translatedOrders = [];
    for (const order of responseData.orders) {
      const translatedItem = await translateItem(order);
      translatedOrders.push(translatedItem);
    }

    responseData.orders = translatedOrders;
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
