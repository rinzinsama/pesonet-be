const Database = use("Database");
const { snakeCase } = use("snake-case");

const valuesChangedFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  const [table] = args;
  let isNotSame = false;
  let requestData = data;
  delete data.isChanged;

  if (!value || !data.referenceId) return;

  const row = await Database.table(table)
    .where("reference_id", data.referenceId)
    .first();

  if (!row) return;

  Object.keys(requestData)
    .filter(key => !Object.keys(row).includes(snakeCase(key)))
    .forEach(key => delete requestData[key]);

  for (const key in requestData) {
    if (row[snakeCase(key)] != requestData[key]) isNotSame = true;
  }

  if (!isNotSame) throw message;
};

module.exports = valuesChangedFn;
