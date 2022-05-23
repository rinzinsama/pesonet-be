"use strict";

const { Command } = require("@adonisjs/ace");
const { js: beautify } = use("js-beautify");
const { camelCase } = use("camel-case");

class ValidatorHook extends Command {
  static get signature() {
    return `
    make:validatorhook
    { filename : Name of the file. }
    `;
  }

  static get description() {
    return "Create an validator hook file";
  }

  getIndexTemplate() {
    return 'const fs = use("fs");let validators = {};const directoryPath = __dirname;fs.readdirSync(directoryPath).forEach(file => {if (file == "index.js") return; validators[file.split(".").shift()] = use(`Start/hooks/Validator/${file}`);}) \n module.exports = validators;';
  }

  getTemplate(name) {
    return `
    const ${name}Fn = async (data, field, message, args, get) => {
        const value = get(data, field);
    
        if (!value) return;
    
        if (true) throw message
    };
    
    module.exports = ${name}Fn;
  `;
  }

  async handle(args, options) {
    const { filename } = args;

    let fileRack = filename.split("/");
    const className = camelCase(fileRack.pop());
    const pathName = fileRack.join("/");

    if (await this.pathExists(`Start/hooks/Validator/${filename}.js`))
      this.error(`${this.icon("error")} file already exist`);
    else {
      if (!(await this.pathExists(`Start/hooks/Validator/index.js`))) {
        const indexTemplate = this.getIndexTemplate();
        await this.writeFile(
          `Start/hooks/Validator/index.js`,
          beautify(indexTemplate)
        );
      }

      const template = this.getTemplate(className);

      await this.writeFile(
        `Start/hooks/Validator/${pathName}/${className}.js`,
        beautify(template)
      );
    }
  }
}

module.exports = ValidatorHook;
