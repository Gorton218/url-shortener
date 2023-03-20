import { DynamoDB } from "aws-sdk";

export function getDynamoDbClient(): DynamoDB {
    const options = {
        region: process.env.AWS_DEFAULT_REGION
    }
    if (process.env.AWSENVNAME == 'AWS_SAM_LOCAL') {
        switch(`${process.env.ENVTYPE}`) {
            case 'OSX': {
                options.endpoint = 'http://docker.for.mac.localhost:8000';
                break;
            }
            case 'Windows': {
                options.endpoint = 'http://host.docker.internal:8000';
                break;
            }
            default: {
                options.endpoint = 'http://dynamodb:8000';
                break;
            }
        }
    }
    return new DynamoDB(options)
}

