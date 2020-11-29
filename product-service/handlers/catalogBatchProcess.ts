import { SQSEvent } from 'aws-lambda';
import { Client } from 'pg';
import { SNS } from 'aws-sdk';

const catalogBatchProcess = async (
  event: SQSEvent
): Promise<{ statusCode: number }> => {
  const sns = new SNS({ region: 'eu-west-1' });
  const client = new Client({ ssl: { rejectUnauthorized: false } });
  client.connect();

  console.log('--event--', event);

  try {
    await client.query('---START---');
    let maxAmount = 0;

    for(const record of event.Records) {
      console.log('--body--', record.body);
      const {
        title,
        description,
        price,
        count,
        cover
      } = JSON.parse(record.body);
      console.log('--record--', title, description, price, count, cover);

      if(!title || !description || Number.isNaN(+price) || Number.isNaN(+count)) {
        console.log(
          `Errors in params: ${JSON.stringify({
            title, description, price, count, cover
          })}`
        );
      } else {
        const { rows: [savedProduct] } = await client.query(
          'insert into products(title, description, price, cover) values ($1, $2, $3, $4) RETURNING *',
          [title, description, +price, cover]
        );

        await client.query(
          'insert into stocks(products_id, count) values ($1, $2)',
          [savedProduct['id'], +count]
        );

        if (count > maxAmount) {
          maxAmount = count;
        }

        console.log('--savedProduct--', savedProduct);
      }
      await client.query('--SAVED--');

      if (event.Records.length) {
        await sns
          .publish({
            Subject: 'All products were loaded',
            Message: `Loaded products: ${event.Records.length}, max batch is ${maxAmount} of goods`,
            MessageAttributes: {
              batchAtStore: {
                DataType: 'Number',
                StringValue: count.toFixed(0),
              },
            },
            TopicArn: process.env.SNS_ARN,
          })
          .promise();
      }

    }
    return { statusCode: 202 };
  } catch (error) {
    await client.query('--ROLLBACK--');
    console.log(error);
  } finally {
    client.end();
  }
}

export default catalogBatchProcess;
