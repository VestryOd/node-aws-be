import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';
import { dbOptions } from '../common/helpers.js';

const addProduct: APIGatewayProxyHandler = async (event, _context) => {
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

  try {
    const { title, description, price, count } = JSON.parse(event.body);
    if (!title || !description || Number.isNaN(price) || Number.isNaN(count)) {
      response.statusCode = 400;
      response.body = JSON.stringify({ error: "Wrong params"});
    } else {
      client.connect();
      await client.query('BEGIN');
      const {
        rows: [newProduct],
      } = await client.query(
        'insert into products(title, description, price) values ($1, $2, $3) RETURNING *',
        [title, description, price]
      );

      console.log('--newProduct--', newProduct);

      await client.query(
        'insert into stocks(products_id, count) values ($1, $2)',
        [newProduct['id'], count]
      );

      await client.query('COMMIT');
      response.body = JSON.stringify({ ...newProduct, count });
      response.statusCode = 200;
    }
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (e) {
      //
    }
    response.body = JSON.stringify({ error });
  } finally {
    client.end();
  }
  return response;
};

export default addProduct;