// export const bhashiniTranslator = async (req, res, next) => {
//     try {
//        const lang= req.query.lang
       
//         console.log("bhashini success",req.body);
//        return res.status(200).json({ message: "Success", data: req.body.responseData, param: req.params.p});
//     } catch (error) {
//         console.log("bhashini failed:", error);
//         return res.status(500).json({ message: "failed" });
//     }
// }
    // const halfLength = Math.ceil(responseData.length );
    // const firstHalf = responseData.slice(0, halfLength);
    // const secondHalf = responseData.slice(halfLength);

import axios from "axios";
export const bhashiniTranslator = async (req, res, next) => {
  try {
    const responseData = JSON.stringify(req.body.responseData);
    console.log("bhashini success", responseData);


    let data = {
      "pipelineTasks": [
        {
          "taskType": "translation",
          "config": {
            "language": {
              "sourceLanguage": "en",
              "targetLanguage": "hi"
            },
            "serviceId": "ai4bharat/indictrans-v2-all-gpu--t4"
          }
        }
      ],
      "inputData": {
        "input": [
          {
            "source": responseData
          }
        ]
      }
    };
    let config = {
      method: 'post',
      url: 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline',
      headers: {
        'Authorization': '5bcJyckKIeDJXW9x_C9gs7P7Rt1goop7SmPyrrdKHF5_4XrWrtMCJaVL8RO8hEJ8', // Replace with your actual authorization token
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(data)
    };

    axios.request(config)
      .then((response) => {
        const responseConvertedData=response.data.pipelineResponse[0].output[0].target
        //  const dataObject = JSON.stringify(responseConvertedData);
        console.log("bhashini success22", responseConvertedData);

        return res.status(200).json({ data: responseConvertedData});
      })
      .catch((error) => {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
  // console.log("responseData",req.body.responseData)
  //return res.status(200).json({ data: req.body.responseData});
};



