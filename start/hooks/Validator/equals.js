const FileReader = use("FileReader");

const equalsFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  if (value == FileReader.getPath()) throw message;
};

module.exports = equalsFn;
