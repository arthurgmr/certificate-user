import { DynamoDB } from "aws-sdk";


const options = {
    region: "localhost",
    endpoint: "http://localhost:8000",
};

const isOffline = () => {
    // the env variable doesn't need to be created;
    // It's came by the serverless;
    return process.env.IS_OFFLINE;
}

export const document = isOffline()
    ? new DynamoDB.DocumentClient(options)
    : new DynamoDB.DocumentClient();