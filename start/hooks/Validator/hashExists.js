const Database = use("Database");
const Hash = use("Hash");

const hashExistsFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  const [table, match, column, columnValue] = args;

  const row = await Database.table(table)
    .where(column, columnValue)
    .first();

  if (row.length == 0) throw message;

  const isSame = await Hash.verify(value, row[match]);

  if (!isSame) throw message;
};

module.exports = hashExistsFn;
