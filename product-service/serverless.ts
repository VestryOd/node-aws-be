import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SNS_ARN: { Ref: 'createProductTopic' },
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['sns:*'],
        Resource: { Ref: 'createProductTopic' },
      },
    ],
  },
  functions: {
    getProductsList: {
      handler: 'handler.getProductsList',
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
            cors: true,
          }
        }
      ]
    },
    getProductById: {
      handler: 'handler.getProductById',
      events: [
        {
          http: {
            method: 'get',
            path: 'products/{productId}',
            request: { parameters: { paths: { productId: true } } },
            cors: true,
          }
        }
      ]
    },
    addProduct: {
      handler: 'handler.addProduct',
      events: [
        {
          http: {
            method: 'post',
            path: 'products',
            cors: true,
          },
        },
      ],
    },
    catalogBatchProcess: {
      handler: 'handler.catalogBatchProcess',
      events: [
        {
          sqs: {
            arn: { 'Fn::GetAtt': ['catalogItemsQueue', 'Arn'] },
            batchSize: 5,
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'vestry-import-products-sqs-queue',
        },
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'vestry-import-products-sns-topic',
        },
      },
      createProductSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'email',
          Endpoint: 'aws.test.acc01@gmail.com',
          TopicArn: {
            Ref: 'createProductTopic',
          },
        },
      },
      createProductBigBatchSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'email',
          Endpoint: 'vabej48343@bcpfm.com',
          TopicArn: {
            Ref: 'createProductTopic',
          },
          FilterPolicy: {
            batchAtStore: [{ numeric: ['>', 50] }],
          },
        },
      },
    },
    Outputs: {
      catalogItemsQueueArn: {
        Description: "SQS Topic URL to publish exported products",
        Value: { 'Fn::GetAtt': ['catalogItemsQueue', 'Arn'] },
      },
      catalogItemsQueueUrl: {
        Description: "SQS Topic ARN to publish exported products",
        Value: { Ref: 'catalogItemsQueue' },
      },
    },
  }
}

module.exports = serverlessConfiguration;
