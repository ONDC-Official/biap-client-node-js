import mongoose from "mongoose";

const dbConnect = async () => {

    // Need to read this from a configuration file
    if (!process.env.DB_CONNECTION_STRING) {
        throw new Error("Database connection string not configured in ENV file");
    }

    const dbUri = process.env.DB_CONNECTION_STRING;

    return mongoose.connect(dbUri);
};

export default dbConnect;