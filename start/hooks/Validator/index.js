const fs = use("fs");
let validators = {};
const directoryPath = __dirname;
fs.readdirSync(directoryPath).forEach(file => {
    if (file == "index.js") return;
    validators[file.split(".").shift()] = use(`Start/hooks/Validator/${file}`);
})
module.exports = validators;