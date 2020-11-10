import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';

const getProductsById: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const { productId } = event.pathParameters; 
    const data = await axios
      .get('http://fake-product-api-aws-tasks.s3-website-eu-west-1.amazonaws.com/')
      .then(res => res.data);

      const foundProduct = data.find(el => el.id === productId);
      if (!foundProduct) {
        return {
          statusCode: 404,
          body: 'Not found'
        }
      }
      return {
        statusCode: 200,
        body: JSON.stringify(foundProduct),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        }
      }
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal cerver error: ${JSON.stringify(error)}`
    }
  }
}

export default getProductsById;
