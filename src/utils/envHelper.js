import dotenv from 'dotenv';
import path from 'path';

const loadEnvVariables = () => {

    if (process.env && process.env.NODE_ENV) 
    {
        dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`) });
    } 
    else 
    {
        dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });
    }

}

export default loadEnvVariables;