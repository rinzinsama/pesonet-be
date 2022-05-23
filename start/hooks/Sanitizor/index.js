const Sanitizor = (exports = module.exports = {});

Sanitizor.toLower = (value) => String(value).toLowerCase();
Sanitizor.toUpper = (value) => String(value).toUpperCase();
Sanitizor.arrayToInt = (value) => value.map((val) => +val);
Sanitizor.moneyToString = (value) => value.replace(/,/g, "");
