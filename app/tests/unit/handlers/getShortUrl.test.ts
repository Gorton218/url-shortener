import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { lambdaHandler } from '../../../src/handlers/getShortUrl';

describe('Unit tests for getShortUrl', () => {
    const event: APIGatewayProxyEvent = {
        httpMethod: 'get',
        body: '',
        headers: {},
        isBase64Encoded: false,
        multiValueHeaders: {},
        multiValueQueryStringParameters: {},
        path: '/hello',
        pathParameters: {},
        queryStringParameters: {},
        requestContext: {
            accountId: '123456789012',
            apiId: '1234',
            authorizer: {},
            httpMethod: 'get',
            identity: {
                accessKey: '',
                accountId: '',
                apiKey: '',
                apiKeyId: '',
                caller: '',
                clientCert: {
                    clientCertPem: '',
                    issuerDN: '',
                    serialNumber: '',
                    subjectDN: '',
                    validity: { notAfter: '', notBefore: '' },
                },
                cognitoAuthenticationProvider: '',
                cognitoAuthenticationType: '',
                cognitoIdentityId: '',
                cognitoIdentityPoolId: '',
                principalOrgId: '',
                sourceIp: '',
                user: '',
                userAgent: '',
                userArn: '',
            },
            path: '/hello',
            protocol: 'HTTP/1.1',
            requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
            requestTimeEpoch: 1428582896000,
            resourceId: '123456',
            resourcePath: '/hello',
            stage: 'dev',
        },
        resource: '',
        stageVariables: {},
    };

    it('should start with BASE_URL', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler(event);
        expect(result.statusCode).toEqual(200);
        var shortUri = JSON.parse(result.body)["message"];
        var matcher = new RegExp(`^${process.env.BASE_URL}`)
        expect(shortUri).toMatch(matcher)
    });

    it('should match requirements', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler(event);
        expect(result.statusCode).toEqual(200);
        var shortUri = JSON.parse(result.body)["message"];
        var matcher = new RegExp(`^${process.env.BASE_URL}\/[0-9a-zA-Z]{${process.env.GENERATED_LENGTH}}`)
        expect(shortUri).toMatch(matcher)
    });
});