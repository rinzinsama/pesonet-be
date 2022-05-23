const Drive = use("Drive");
const Helpers = use("Helpers");

const isBankBicFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  const bic = await Drive.get(Helpers.tmpPath("bank.txt"));
  const parsedBIC = bic.toString();

  if (parsedBIC != value) throw message;
};

module.exports = isBankBicFn;
