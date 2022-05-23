const isPaginateFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  if (!data.limit) throw message;
};

module.exports = isPaginateFn;
