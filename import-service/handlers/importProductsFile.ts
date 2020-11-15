import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3 } from 'aws-sdk';

const importProductsFile: APIGatewayProxyHandler = async (event, _context) => {
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
  const s3 = new S3({ region: 'eu-west-1' });

  try {
    const { name } = event.queryStringParameters;
    const s3response = await s3.getSignedUrlPromise('putObject', {
      Bucket: 'vestry-import-bucket',
      Key: `uploaded/${name}`,
      Expires: 600,
      ContentType: 'text/csv',
    });
    response.body = JSON.stringify({ url: s3response });
    response.statusCode = 200;
  } catch (error) {
    response.body = JSON.stringify({ error });
  }
  
  return response;
};

export default importProductsFile;