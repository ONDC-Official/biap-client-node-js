import axios from "axios";

export const bhashiniTranslator = async (req, res, next) => {
  try {
    let lang;
    if (!req.query.lang || req.query.lang === "en") {
      return res.status(200).json(req.body.responseData);
    } else {
      lang = req.query.lang;
    }
    const { page } = req.query; // Extract page number from query parameter

    let responseData = req.body.responseData;
    const itemsPerPage = 10;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToTranslate = responseData.response.data
      .slice(startIndex, endIndex)
      .map((item) => ({
        itemName: item.item_details.descriptor.name.includes("ASSN.")
          ? item.item_details.descriptor.name.replace(/ASSN./g, "")
          : item.item_details.descriptor.name,
        providerName: item.provider_details.descriptor.name,
      }));

    // Extract values for translation
    const valuesToTranslate = itemsToTranslate.flatMap((item) => [
      item.itemName,
      item.providerName,
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
        let translatedValues =
          response.data.pipelineResponse[0].output[0].target
            .split(",")
            .map((item) => item.split('"')[1]);

        let translatedData = responseData.response.data.map((item, index) => {
          let transIndex = index * 2;
          item.item_details.descriptor.name = translatedValues[transIndex];
          item.provider_details.descriptor.name =
            translatedValues[transIndex + 1];
          return item;
        });
        responseData.response.data = translatedData;

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
