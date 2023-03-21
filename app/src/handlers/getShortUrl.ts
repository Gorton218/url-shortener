import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { AWSError, DynamoDB } from "aws-sdk";
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

function parseBody(rawBody: string) {
    var body;
    try {
        body = JSON.parse(`${rawBody}`);
    } catch (error) {
        return {
            valid: false,
            content: "Request body is not json. Provide 'url:' for shortening as body payload"
        }
    }
    if (!body.url) {
        return {
            valid: false,
            content: "Request body has no 'url' property. Provide 'url:' for shortening as body payload"
        }
    }
    return {
        valid: true,
        content: body
    };
}

async function getOriginalUrlIfPresent(dynamoDB: DynamoDB, originalUrl: string): Promise<string> {
    const params: DynamoDB.QueryInput = {
        TableName: `${process.env.DYNAMODB_TABLE}`,
        IndexName: "OriginalUrlIndex",
        KeyConditionExpression: '#name = :value',
        ExpressionAttributeNames: {
          '#name': 'OriginalUrl'
        },
        ExpressionAttributeValues: {
          ':value': { S: originalUrl }
        },
        Limit: 1
    };
    
    var ret;
    try {
        const resp = await dynamoDB.query(params).promise();
        console.log('====');
        console.log(JSON.stringify(resp));
        console.log('====');
        if (resp.Items && resp.Items.length == 1) {
            return Promise.resolve(`${resp.Items[0]["ShortUri"]["S"]}`)
        }
    } catch (error) {
        console.error(error);
    }
    return Promise.resolve("");

}

function composeSuccessResponse(shortUri: string): APIGatewayProxyResult {
    return {
        statusCode: 200,
        body: JSON.stringify({
            result: true,
            message: new URL(shortUri, process.env.BASE_URL).href,
        }),
    };
}

async function writeShortUri(dynamoDB: DynamoDB, shortUri: string, originalUrl: string) {
    const item: AWS.DynamoDB.PutItemInputAttributeMap = {
        'ShortUri': { S: shortUri },
        'OriginalUrl': { S: originalUrl }
    };
    const params: AWS.DynamoDB.PutItemInput = {
        TableName: `${process.env.DYNAMODB_TABLE}`,
        Item: item,
        ConditionExpression: 'attribute_not_exists(ShortUri)'
    };
    var ret = {
        duplicate: false,
        success: false,
    }
    var resp
    try {
        resp = await dynamoDB.putItem(params).promise();
        ret.duplicate = false;
        ret.success = true;
    } catch (error: AWSError) {
        if (error.code === 'ConditionalCheckFailedException') {
            ret.duplicate = true;
            ret.success = false;
        } else {
            console.log(error);
            ret.duplicate = false;
            ret.success = false;
        }
    }
    return Promise.resolve(ret);
}

export const lambdaHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const parsed = parseBody(`${event.body}`)
    if (!parsed.valid) {
        return {
            statusCode: 422,
            body: JSON.stringify({
                result: false,
                message: parsed.content,
            }),
        };
    }
    const originalUrl = parsed.content.url.trim();

    const dynamoDB = getDynamoDbClient();

    var shortUri = await getOriginalUrlIfPresent(dynamoDB, originalUrl);
    if (shortUri) {
        console.info(`short uri ${shortUri} for ${originalUrl} already exists in database`);
        return composeSuccessResponse(shortUri);
    }

    const maxRetries = 10
    for (let retry = 0; retry < maxRetries; retry++) {
        const shortUri = generateShortUri();
        const res = await writeShortUri(dynamoDB, shortUri, originalUrl);
        if (res.success) {
            return composeSuccessResponse(shortUri);
        }
        console.info(`Duplicate found while inserting new data. Retry ${retry} from ${maxRetries}`);
    }
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
};
