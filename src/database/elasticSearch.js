import{ Client } from '@elastic/elasticsearch';
import loadEnvVariables from '../utils/envHelper.js';
loadEnvVariables();

const client = new Client({
  node: process.env.ELASTIC_SEARCH_URL
});

export default client;
