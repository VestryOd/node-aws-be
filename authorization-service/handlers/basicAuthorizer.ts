import { APIGatewayTokenAuthorizerHandler, PolicyDocument } from 'aws-lambda';

const basicAuthorizer: APIGatewayTokenAuthorizerHandler = async (event) => {
  console.log('--event--', JSON.stringify(event));

  if (event.type !== 'TOKEN')
    throw 'Unauthorized';

  try {
    const authorisationToken = event.authorizationToken;

    const principalId = authorisationToken.split(' ')[1];
    const [username, password] = Buffer.from(principalId, 'base64')
                                .toString('utf-8')
                                .split(':');

    console.log('--user & pass--', username, password);

    const storedUserPassword = process.env[username];
    const effect = !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';

    return {
      principalId,
      policyDocument: generatePolicy(event.methodArn, effect)
    };

  } catch (error) {
    console.log(error);
    throw `Unauthorized`;
  }
};

const generatePolicy: (
  resource: string,
  effect: string
) => PolicyDocument = (resource, effect = 'Allow') => {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }
    ]
  };
};

export default basicAuthorizer;
