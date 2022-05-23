const Database = use("Database");

const arrayExistsFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  const [table, column] = args;

  const row = await Database.table(table);

  if (row.length == 0) throw message;

  let columnRack = row.map(rack => rack[column]);

  const exists = value.every(val => columnRack.includes(val));

  if (!exists) throw message;
};

module.exports = arrayExistsFn;
