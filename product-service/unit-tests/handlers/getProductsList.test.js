// const utils = require('aws-lambda-test-utils');
// var APIGatewayEvent = utils.mockEventCreator.createAPIGatewayEvent();
 
// Default options (which can be overridden):
// {
//   path: "default/path",
//   method: "GET",
//   headers: {
//     "default-header": 'default'
//   },
//   queryStringParameters: {
//     query: "default"
//   },
//   pathParameters: {
//     uuid: '1234'
//   },
//   stageVariables: {
//     ENV: "test"
//   },
//   body: "default body"
// }
import jest from 'jest';
import getProductsList from '../../handlers/getProductsList';
import axios from 'axios';
