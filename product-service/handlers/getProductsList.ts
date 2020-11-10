import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';


const getProductsList: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const data = await axios
      .get('http://fake-product-api-aws-tasks.s3-website-eu-west-1.amazonaws.com/')
      .then(res => res.data);
      return {
        statusCode: 200,
        body: JSON.stringify(data),
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

export default getProductsList;
