const arrayDuplicatesFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  if (new Set(value).size !== value.length) throw message;
};

module.exports = arrayDuplicatesFn;
