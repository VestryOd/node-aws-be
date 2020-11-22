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
        //
        return { statusCode: 202 };
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
    } finally {
        client.end();
    }
}

export default catalogBatchProcess;
