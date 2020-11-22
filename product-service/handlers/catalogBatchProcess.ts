import { SQSEvent } from 'aws-lambda';
import { Client } from 'pg';
import { SNS } from 'aws-sdk';

const catalogBatchProcess = async (
    event: SQSEvent
): Promise<{ statusCode: number }> => {
    const sns = new SNS({ region: 'eu-west-1' });
    const client = new Client({ ssl: { rejectUnauthorized: false } });
    client.connect();

    try {
        await client.query('BEGIN');

        for (const record of event.Records) {
            const { title, description, price, count } = JSON.parse(record.body);
            if (!title || !description || Number.isNaN(+price) || Number.isNaN(+count)) {
                console.log(
                  `Error in such params: ${JSON.stringify({
                      title,
                      description,
                      price,
                      count,
                  })}`
                );
            } else {
                const {
                    rows: [insertedProduct],
                } = await client.query(
                  'insert into products(title, description, price) values ($1, $2, $3) RETURNING *',
                  [title, description, +price]
                );

                await client.query(
                  'insert into stocks(product_id, count) values ($1, $2)',
                  [insertedProduct['id'], +count]
                );
            }

            await client.query('COMMIT');
            if (event.Records.length) {
                await sns
                  .publish({
                      Subject: 'Products loaded',
                      Message: `Loaded products: ${event.Records.length}`,
                      MessageAttributes: {
                        zeroCountAtStore: {
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
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
    } finally {
        client.end();
    }
}

export default catalogBatchProcess;
