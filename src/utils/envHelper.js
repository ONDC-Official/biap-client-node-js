import dotenv from 'dotenv';
import path from 'path';

const loadEnvVariables = () => {

    if (process.env.NODE_ENV=="development")
    {
        console.log("development mode!!!!")
        dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`) });
    }

}

export default loadEnvVariables;