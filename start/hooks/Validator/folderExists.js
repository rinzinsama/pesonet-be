const Drive = use("Drive");

const folderExistsFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  if (!await Drive.exists(value)) throw message;
};

module.exports = folderExistsFn;
