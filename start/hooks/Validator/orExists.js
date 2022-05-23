const Database = use("Database");

const orExistsFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  const [firstTable, secondTable, column] = args;

  const firstRow = await Database.table(firstTable)
    .where(column, value)
    .first();
  const secondRow = await Database.table(secondTable)
    .where(column, value)
    .first();

  if (!firstRow && !secondRow) throw message;
};

module.exports = orExistsFn;
