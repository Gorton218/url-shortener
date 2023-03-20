import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from "aws-sdk";
import { getDynamoDbClient } from '../helpers/dynamoDbHelper';

export const lambdaHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const dynamoDB = getDynamoDbClient();
    // return empty 200 response because request is empty
    // TODO: implement new mechanism according to business value
    if (!event.pathParameters || !event.pathParameters.shortUri) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                result: true,
                message: "no request found",
            }),
        };
    }

    // const params: DynamoDB.QueryInput = {
    //     TableName: `${process.env.DYNAMODB_TABLE}`,
    //     IndexName: "OriginalUrlIndex",
    //     KeyConditionExpression: '#name = :value',
    //     ExpressionAttributeNames: {
    //       '#name': 'OriginalUrl'
    //     },
    //     ExpressionAttributeValues: {
    //       ':value': { S: `${event.pathParameters.shortUri}` }
    //     }
    // };

    // TODO: implement action if nothing was found
    const params: AWS.DynamoDB.GetItemInput = {
        TableName: `${process.env.DYNAMODB_TABLE}`,
        Key: {
            'ShortUri': { S: `${event.pathParameters.shortUri}` }
        }
    };

    var ret = null
    try {
        const resp = await dynamoDB.getItem(params).promise();
        if (!resp.Item) {
            // TODO: implement action if nothing was found
            return {
                statusCode: 200,
                body: JSON.stringify({
                    result: true,
                    message: "nothing found",
                }),
            };
        }

        // Return REDIRECT
        return {
            statusCode: 302,
            headers: {
                'Location': `${resp.Item.OriginalUrl.S}`
            },
            body: ''
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                result: false,
                message: error,
            }),
        };
    }
    
};
