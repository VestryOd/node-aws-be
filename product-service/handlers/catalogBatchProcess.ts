import { SQSEvent } from 'aws-lambda';
import { Client } from 'pg';

const catalogBatchProcess = async (
  event: SQSEvent
): Promise<{ statusCode: number }> => {
  const client = new Client({ ssl: { rejectUnauthorized: false } });
  client.connect();

  try {
    await client.query('START');

    for(const record of event.Records) {
      const {
        title,
        description,
        price,
        count
      } = JSON.parse(record.body);

      if(!title || !description || Number.isNaN(+price) || Number.isNaN(+count)) {
        console.log(
          `Errors in params: ${JSON.stringify({
            title, description, price, count
          })}`
        );
      } else {
        const { rows: [savedProduct] } = await client.query(
          'insert into products(title, description, price) values ($1, $2, $3) RETURNING *',
          [title, description, price]
        );

        await client.query(
          'insert into stocks(products_id, count) values ($1, $2)',
          [savedProduct['id'], count]
        );
      }
      await client.query('SAVED');
    }
    return { statusCode: 202 };
  } catch (error) {
    await client.qiery('ROLLBACK');
    console.log(error);
  } finally {
    client.end();
  }
}

export default catalogBatchProcess;
