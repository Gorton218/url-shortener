import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from "aws-sdk";
import crypto from 'crypto';
import { getDynamoDbClient } from '../helpers/dynamoDbHelper';

const baseString = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const shortUrlLength: number = parseInt(`${process.env.GENERATED_LENGTH}`);

function generateShortUri() {
    let ret = '';
    crypto.randomBytes(shortUrlLength).forEach((element) => {
        ret += baseString[element % baseString.length];
    });
    return ret
}

// function parseOriginUrl(event: APIGatewayEvent): string {
//     if (!event.body) {
//         return ''
//     }
//     const ret = JSON.parse(event.body)
// }

export const lambdaHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    var body
    try {
        body = JSON.parse(`${event.body}`)
    } catch (error) {
        return {
            statusCode: 422,
            body: JSON.stringify({
                result: false,
                message: "Request body is not json. Provide 'url:' for shortening as body payload",
            }),
        };
    }
    if (!body.url) {
        return {
            statusCode: 422,
            body: JSON.stringify({
                result: false,
                message: "Request body has no 'url' property. Provide 'url:' for shortening as body payload",
            }),
        };
    }
    const originalUrl = body.url.trim();
    var success = false
    var shortUri = ''
    while (!success) {
        shortUri = generateShortUri();
        const dynamoDB = getDynamoDbClient();
        let params: DynamoDB.PutItemInput = {
            TableName: `${process.env.DYNAMODB_TABLE}`,
            Item: {
                OriginalUrl: { S: originalUrl },
                ShortUri: { S: shortUri }
            },
        };
        var res
        try {
            res = await dynamoDB.putItem(params).promise();
        } catch (error) {
            console.error(error)
            return {
                statusCode: 200,
                body: JSON.stringify({
                    result: false,
                    message: error,
                }),
            };
        }
        console.log("DynamoDB result:", res)
        success = true;
    }
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    // console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    return {
        statusCode: 200,
        body: JSON.stringify({
            result: true,
            message: new URL(shortUri, process.env.BASE_URL).href,
        }),
    };
};
