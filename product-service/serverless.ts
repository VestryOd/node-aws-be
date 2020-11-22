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
      includeModules: {
        forceExclude: 'aws-sdk',
      },
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
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
      PGHOST: process.env.PG_HOST,
      PGDATABASE: process.env.PG_DB,
      PGUSER: process.env.USER,
      PGPASSWORD: process.env.PG_PWD,
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
            arn: { 'Fn::GetAtt': ['productsItemsQueue', 'Arn'] },
            batchSize: 5,
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      productsItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'vestry-import-products-sqs-queue',
        },
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'vestry-product-import-sns-topic',
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
      zeroCountCreateProductSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'email',
          Endpoint: 'kaedan.17@puttingpv.com',
          TopicArn: {
            Ref: 'createProductTopic',
          },
          FilterPolicy: {
            zeroCountAtStore: [{ numeric: ['<=', 0] }],
          },
        },
      },
    },
    Outputs: {
      productsItemsQueueArn: {
        Value: { 'Fn::GetAtt': ['productsItemsQueue', 'Arn'] },
      },
      productsItemsQueueUrl: {
        Value: { Ref: 'productsItemsQueue' },
      },
    }
  }
}

module.exports = serverlessConfiguration;
