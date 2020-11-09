import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';
import { dbOptions, checkUuid } from '../common/helpers.js';

const addProduct: APIGatewayProxyHandler = async (event, _context) => {};

export default addProduct;