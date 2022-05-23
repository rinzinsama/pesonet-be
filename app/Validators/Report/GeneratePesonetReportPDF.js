"use strict";

const Serializer = use("Library/Validator/Serializer");

class ReportGeneratePesonetReportPDF {
  async authorize() {
    const user = this.ctx.auth.user;

    if (![2, 3].includes(+user.role_id))
      return this.ctx.response.status(403).json({
        message: "You are not allowed access this method.",
      });

    return true;
  }

  get validateAll() {
    return true;
  }

  get rules() {
    return {
      transactions: "required|array",
      date: "required|string",
    };
  }

  get messages() {
    return {
      "transactions.required": "(transactions) is required.",
      "transactions.array": "(transactions) must be an array.",
      "date.required": "(transactions) is required.",
      "date.string": "(transactions) must be a string.",
    };
  }

  get sanitizationRules() {
    return {
      date: "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = ReportGeneratePesonetReportPDF;
