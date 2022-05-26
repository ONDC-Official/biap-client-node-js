import NoRecordFoundError from "../../../lib/errors/no-record-found.error.js";
import DistrictMongooseModel from './district.js';

/**
 * get the city with passed district code from the database
 * @param {String} transactionId 
 * @returns 
 */
const getCityList = async (districtCode) => {
    const district = await DistrictMongooseModel.find({
        districtCode: districtCode
    });

    if (!(district || district.length))
        throw new NoRecordFoundError();
    else
        return district?.[0]?.cities;
};

export { getCityList };