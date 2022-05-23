const inStringArrayFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  const rack = args.map((val) => `${val}`);

  if (!rack.includes(value)) throw message;
};

module.exports = inStringArrayFn;
