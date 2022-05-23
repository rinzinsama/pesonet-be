const moment = use("moment");

const isDateFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  if (!moment(value, "YYYY-MM-DD", true).isValid()) throw message;
};

module.exports = isDateFn;
