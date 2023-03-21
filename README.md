# URL Shortener

## Prerequisites
1. [NodeJS 18.x](https://nodejs.org/en/download/package-manager)
1. [AWS Serverless Application Model (AWS SAM)](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
1. [Docker](https://docs.docker.com/get-docker/)

## Prepare Local Dev environment
1. prepare local environment by running `aws configure` or exporting required `AWS_*` related env variables

### DynamoDB
1. start DynamoDB locally with `docker compose up -d`
1. check if it has tables with `aws dynamodb list-tables --endpoint-url http://localhost:8000`
1. create new table `aws dynamodb create-table --cli-input-json file://json/createUrlTable.json --endpoint-url http://localhost:8000`


## Usage
1. navigate to `app` folder
1. run `npm install` to install all dependencies
1. ~~run `npm run test`~~ (CURRENTLY NOT WORKING)
1. navigate back to root folder
1. run `sam local start-api --env-vars json/env.json` for manual API test[(read more)](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-start-api.html)

sam sync --stack-name sam-app --watch


## Algorithm explanation
Idea behind the scene is to provide short url based on random number generator. The reasons is:
- customers actually doesn't cares about how exactly short link was crafted. They want to have it short
- no hash algorithm guarantees hash collisions
- provided hash by any hash algorithm is long enough to be called short link so it anyway should be cutted