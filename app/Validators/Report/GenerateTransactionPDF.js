"use strict";

const Serializer = use("Library/Validator/Serializer");

class ReportGenerateTransactionPDF {
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
      type: "required|string|inStringArray:inward,outward",
    };
  }

  get messages() {
    return {
      "transactions.required": "(transactions) is required.",
      "transactions.array": "(transactions) must be an array.",
      "type.required": "(type) is required.",
      "type.string": "(type) must be a string.",
      "type.inStringArray": "(type) value is invalid.",
    };
  }

  get sanitizationRules() {
    return {
      type: "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = ReportGenerateTransactionPDF;
