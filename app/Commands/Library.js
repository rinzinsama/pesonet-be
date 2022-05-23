"use strict";

const { Command } = use("@adonisjs/ace");
const { js: beautify } = use("js-beautify");

class Library extends Command {
  static get signature() {
    return `
    make:library
    { filename : Name of the file. }
    `;
  }

  static get description() {
    return "Create a library file.";
  }

  getTemplate(name) {
    return `'use strict'

    class ${name} {
    }

    module.exports = ${name}
    `;
  }

  async handle(args, options) {
    const { filename } = args;

    if (await this.pathExists(`Library/${filename}.js`))
      this.error(`${this.icon("error")} file already exist`);
    else {
      let fileRack = filename.split("/");
      const className = fileRack.pop();
      const pathName = fileRack.join("/");

      const template = this.getTemplate(className);

      await this.writeFile(
        `Library/${pathName}/${className}.js`,
        beautify(template)
      );
    }
  }
}

module.exports = Library;
