const regexFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  const [expression, flag] = args;
  const regex = new RegExp(expression, flag);

  if (!regex.test(value)) throw message;
};

module.exports = regexFn;
