const { Client } = require('pg');

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;
const dbOptions = {
  host: PG_HOST,
  port: PG_PORT,
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000
};

module.exports.invoke = async event => {
  const client = new Client(dbOptions);
  await client.connect();

  try {
    // make ddl query for creation table
    const ddlProduct = await client.query(`
      create table if not exist todo_list (
        id uuid (primary key),
        title text not null,
        description text,
        price integer
      )`);
      const ddlStock = await client.query(`
      create table if not exist todo_item (
        id uuid,
        count integer,
        foreeign key ("id") references "products" ("id")
      )`);
  } catch (error) {
    console.error('Error during database request executing', error);
  } finally {
    // incase if error was occured, connection will not close automatically
    client.end(); //manualclosing of connection
  }
}