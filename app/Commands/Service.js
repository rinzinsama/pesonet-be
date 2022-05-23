"use strict";

const { Command } = require("@adonisjs/ace");
const { js: beautify } = use("js-beautify");
const { pascalCase } = use("pascal-case");

class Service extends Command {
  static get signature() {
    return `
    make:service
    { filename : Name of the file. }
    `;
  }

  static get description() {
    return "Create a service file";
  }

  getTemplate(name) {
    return `'use strict'

      class ${name}Service {
      }

      module.exports = ${name}Service
      `;
  }

  async handle(args, options) {
    const { filename } = args;

    if (await this.pathExists(`App/Controllers/Services/${filename}.js`))
      this.error(`${this.icon("error")} file already exist`);
    else {
      let fileRack = filename.split("/");
      const className = pascalCase(fileRack.pop());
      const pathName = fileRack.join("/");

      const template = this.getTemplate(className);

      await this.writeFile(
        `App/Controllers/Services/${pathName}/${className}.js`,
        beautify(template)
      );
    }
  }
}

module.exports = Service;
