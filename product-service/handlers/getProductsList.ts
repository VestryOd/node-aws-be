import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';
import { dbOptions } from '../common/helpers.js';

const getProductsList: APIGatewayProxyHandler = async (event, _context) => {
  
  const client = new Client(dbOptions);
  const response = {
    statusCode: 500,
    body: JSON.stringify({
      error: 'Something went wrong'
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    }
  };
  console.log('---Event log---', { event });

  try {
    client.connect();

    const { rows: productsData } = await client.query(
      'select p.*, s.count from products p join stocks s on p.id = s.products_id'
    );
    console.log('---productsData---', productsData);
    response.body = JSON.stringify(productsData);
    response.statusCode = 200;
  } catch (error) {
    response.body = JSON.stringify({ error });
  } finally {
    client.end();
  }
  return response;
}

export default getProductsList;
