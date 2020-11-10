import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';
import { dbOptions, checkUuid } from '../common/helpers.js';

const getProductsById: APIGatewayProxyHandler = async (event, _context) => {
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
    const { productId } = event.pathParameters; 
    
    if (!productId || !checkUuid(productId)) {
      response.statusCode = 400;
      response.body = JSON.stringify({ error: 'Wrong or invalid id' });
    } else {
      client.connect();

      const { rows: [foundItem] } = await client.query(
        'select p.*, s.count from products p join stocks s on s.products_id = p.id where p.id = $1',
        [productId]
      );
      console.log('---Found product---', foundItem);

      response.statusCode = foundItem ? 200 : 404;
      response.body = foundItem ? JSON.stringify(foundItem) : JSON.stringify({ error: 'No products found' });
    }
  } catch (error) {
    response.body = JSON.stringify({ error });
  } finally {
    client.end();
  }
  return response;
}

export default getProductsById;
