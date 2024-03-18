import axios from "axios";
class MapController {
  async mmiToken(req, res, next) {
    try {
      let params = {
        grant_type: "client_credentials",
        client_id: process.env.MMI_CLIENT_ID,
        client_secret: process.env.MMI_CLIENT_SECRET,
      };

      var paramsData = new URLSearchParams();
      paramsData.append("grant_type", params.grant_type);
      paramsData.append("client_id", params.client_id);
      paramsData.append("client_secret", params.client_secret);

      let headers = { "Content-Type": "application/x-www-form-urlencoded" };

      let result = await axios.post(
        "https://outpost.mapmyindia.com/api/security/oauth/token",
        paramsData,
        { headers }
      );

      res.send(result.data);
    } catch (error) {
      console.log("[ProjectController] [getUploadUrl] Error -", error);
      next(error);
    }
  }

  async getCoordinates(req, res, next) {
    try {
      const result = await axios.get(
        "https://api.geoapify.com/v1/geocode/search",
        {
          params: {
            postcode: req.query.postcode,
            apiKey: process.env.MAP_API_KEY,
          },
        }
      );
      if (result.data.features[0] == undefined) {
        return res.status(400).json({
          success: false,
          message: "Invalid pincode",
        });
      }
      return res.status(200).json({
        success: true,
        data: {
          longitude: result.data.features[0].properties.lon,
          latitude: result.data.features[0].properties.lat,
          pincode: req.query.postcode,
        },
      });
    } catch (err) {
      console.log("err", err);
      next(err);
    }
  }
}

export default MapController;
