const notEqualFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  const [match] = args;

  if (match != value) throw message;
};

module.exports = notEqualFn;
