const b64RegexFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  const [b64] = args;
  const [expression, flag] = Buffer.from(b64, "base64").toString().split("|");

  const regex = new RegExp(expression, flag);

  if (!regex.test(value)) throw message;
};

module.exports = b64RegexFn;
