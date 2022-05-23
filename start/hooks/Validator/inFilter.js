const Database = use("Database");

const inFilterFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  const [table, column, ...addons] = args;

  const row = await Database.table(table);

  if (row.length == 0) throw message;

  let columnRack = row.map(rack => rack[column]);

  if (addons) {
    columnRack = [...columnRack, ...addons.map(addon => +addon)];
  }

  if (!columnRack.includes(value)) throw message;
};

module.exports = inFilterFn;
