"use strict";
const Serializer = use("Library/Validator/Serializer");

class APISendInwardBatchStatusUpdate {
  async authorize() {
    const user = this.ctx.auth.user;

    if (user.role_id != 1)
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
      bicOfBank: "required|string",
      originalMessageId: "required|string",
      "transactions.*.endToEndId": "required|string",
      "transactions.*.transactionStatus": "required|string",
      "transactions.*.remarks": "required|string",
      "transactions.*.creditedAmount": "required|string",
      "transactions.*.beneficiaryName": "required|string",
      "transactions.*.beneficiaryAccountNumber": "required|string",
      "transactions.*.beneficiaryBIC": "required|string",
    };
  }

  get messages() {
    return {
      "bicOfBank.required": "(bicOfBank) is required.",
      "bicOfBank.string": "(bicOfBank) must be string.",
      "originalMessageId.required": "(originalMessageId) is required.",
      "originalMessageId.string": "(originalMessageId) must be string.",
      "transactions.*.endToEndId.required": "(endToEndId) is required.",
      "transactions.*.endToEndId.string": "(endToEndId) must be string.",
      "transactions.*.transactionStatus.required":
        "(transactionStatus) is required.",
      "transactions.*.transactionStatus.string":
        "(transactionStatus) must be string.",
      "transactions.*.remarks.required": "(remarks) is required.",
      "transactions.*.remarks.string": "(remarks) must be string.",
      "transactions.*.creditedAmount.required": "(creditedAmount) is required.",
      "transactions.*.creditedAmount.string":
        "(creditedAmount) must be string.",
      "transactions.*.beneficiaryName.required":
        "(beneficiaryName) is required.",
      "transactions.*.beneficiaryName.string":
        "(beneficiaryName) must be string.",
      "transactions.*.beneficiaryAccountNumber.required":
        "(beneficiaryAccountNumber) is required.",
      "transactions.*.beneficiaryAccountNumber.string":
        "(beneficiaryAccountNumber) must be string.",
      "transactions.*.beneficiaryBIC.required": "(beneficiaryBIC) is required.",
      "transactions.*.beneficiaryBIC.string":
        "(beneficiaryBIC) must be string.",
    };
  }

  get sanitizationRules() {
    return {
      bicOfBank: "trim",
      originalMessageId: "trim",
      "transactions.*.endToEndId": "trim",
      "transactions.*.transactionStatus": "trim",
      "transactions.*.remarks": "trim",
      "transactions.*.creditedAmount": "trim|moneyToString",
      "transactions.*.beneficiaryName": "trim",
      "transactions.*.beneficiaryAccountNumber": "trim",
      "transactions.*.beneficiaryBIC": "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = APISendInwardBatchStatusUpdate;
