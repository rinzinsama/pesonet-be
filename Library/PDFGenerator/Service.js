"use strict";
const pdf = use("pdf-creator-node");
const Drive = use("Drive");
const Helpers = use("Helpers");
const Env = use("Env");

class Service {
  constructor(
    template,
    data,
    path,
    format = "A4",
    orientation = "portrait",
    border = "10mm",
    header = null,
    footer = null
  ) {
    this.template = template;
    this.data = {
      host: Env.get("APP_URL"),
      ...data,
    };
    this.path = path;
    this.options = {
      format,
      orientation,
      border,
      timeout: 3600000,
    };

    if (header) this.options.header = header;
    if (footer) this.options.footer = footer;
  }

  async getTemplate() {
    return await Drive.get(Helpers.tmpPath(this.template), "utf8");
  }

  async generatePDF() {
    const template = await this.getTemplate();

    const document = {
      html: template,
      data: this.data,
      path: Helpers.tmpPath(this.path),
    };

    await pdf.create(document, this.options);
  }
}

module.exports = Service;
