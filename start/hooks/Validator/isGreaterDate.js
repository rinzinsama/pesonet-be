const moment = use("moment");

const isGreaterDateFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  let [from] = args;
  from = moment(data[from], "YYYY-MM-DD");

  const result = moment(value, "YYYY-MM-DD").isSameOrAfter(from);

  if (!result) throw message;
};

module.exports = isGreaterDateFn;
