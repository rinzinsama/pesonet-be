const Database = use("Database");

const allowedStatusFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  const [table, ...status] = args;

  const row = await Database.table(table)
    .where("reference_id", value)
    .whereIn("status", status)
    .first();

  if (!row) throw message;
};

module.exports = allowedStatusFn;
