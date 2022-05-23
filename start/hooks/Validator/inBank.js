const Drive = use("Drive");
const Helpers = use("Helpers");

const inBankFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  const list = await Drive.get(Helpers.tmpPath("bank_list/list.json"));
  const parsedList = JSON.parse(list.toString());
  const exist = parsedList.PESONetMemberBanks.find(
    (list) => list.BICFI == value
  );

  if (!exist) throw message;
};

module.exports = inBankFn;
