const dbOptions = {
  ssl: {
    rejectUnauthorized: false
  }
};

const checkUuid = (id) => {
  return Boolean(id.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  ));
};

const checkPostParams = (data) => {
  const { title, description, price, count } = data;
  return !title || !description || !price || !count || Number.isNaN(price) || Number.isNaN(count)
};

export {
  dbOptions,
  checkUuid,
  checkPostParams
};