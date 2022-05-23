"use strict";
const Serializer = use("Library/Validator/Serializer");

class APISendOutwardMessage {
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
      "transactions.*.ofiReferenceNumber": "required|string|max:16",
      "transactions.*.amount": "required|string",
      "transactions.*.remitterName": "required|string|max:50",
      "transactions.*.remitterAddress": "required|string",
      "transactions.*.remitterAccountNumber": "required|string|max:16",
      "transactions.*.remitterBIC": "required|string",
      "transactions.*.beneficiaryName": "required|string|max:50",
      "transactions.*.beneficiaryAddress": "string",
      "transactions.*.beneficiaryAccountNumber": "required|string|max:16",
      "transactions.*.beneficiaryBIC": "required|string",
      "transactions.*.rfiReferenceNumber": "string|max:16",
      "transactions.*.ofiCustomerReferenceNumber": "string|max:16",
      "transactions.*.rfiCustomerReferenceNumber": "string|max:16",
      "transactions.*.instructions": "required|string|max:163",
    };
  }

  get messages() {
    return {
      "bicOfBank.required": "(bicOfBank) is required.",
      "bicOfBank.string": "(bicOfBank) must be string.",
      "transactions.*.ofiReferenceNumber.required":
        "(ofiReferenceNumber) is required.",
      "transactions.*.ofiReferenceNumber.string":
        "(ofiReferenceNumber) must be string.",
      "transactions.*.ofiReferenceNumber.max":
        "(ofiReferenceNumber) must not exceed 16 characters.",
      "transactions.*.amount.required": "(amount) is required.",
      "transactions.*.amount.string": "(amount) must be string.",
      "transactions.*.remitterName.required": "(remitterName) is required.",
      "transactions.*.remitterName.string": "(remitterName) must be string.",
      "transactions.*.remitterName.max":
        "(remitterName) must not exceed 50 characters.",
      "transactions.*.remitterAddress.required":
        "(remitterAddress) is required.",
      "transactions.*.remitterAddress.string":
        "(remitterAddress) must be string.",
      "transactions.*.remitterAccountNumber.required":
        "(remitterAccountNumber) is required.",
      "transactions.*.remitterAccountNumber.string":
        "(remitterAccountNumber) must be string.",
      "transactions.*.remitterAccountNumber.max":
        "(remitterAccountNumber) must not exceed 16 characters.",
      "transactions.*.remitterBIC.required": "(remitterBIC) is required.",
      "transactions.*.remitterBIC.string": "(remitterBIC) must be string.",
      "transactions.*.beneficiaryName.required":
        "(beneficiaryName) is required.",
      "transactions.*.beneficiaryName.string":
        "(beneficiaryName) must be string.",
      "transactions.*.beneficiaryName.max":
        "(beneficiaryName) must not exceed 50 characters.",
      "transactions.*.beneficiaryAddress.required":
        "(beneficiaryAddress) is required.",
      "transactions.*.beneficiaryAddress.string":
        "(beneficiaryAddress) must be string.",
      "transactions.*.beneficiaryAccountNumber.required":
        "(beneficiaryAccountNumber) is required.",
      "transactions.*.beneficiaryAccountNumber.string":
        "(beneficiaryAccountNumber) must be string.",
      "transactions.*.beneficiaryAccountNumber.max":
        "(beneficiaryAccountNumber) must not exceed 16 characters.",
      "transactions.*.beneficiaryBIC.required": "(beneficiaryBIC) is required.",
      "transactions.*.beneficiaryBIC.string":
        "(beneficiaryBIC) must be string.",
      "transactions.*.rfiReferenceNumber.required":
        "(rfiReferenceNumber) is required.",
      "transactions.*.rfiReferenceNumber.string":
        "(rfiReferenceNumber) must be string.",
      "transactions.*.rfiReferenceNumber.max":
        "(rfiReferenceNumber) must not exceed 16 characters.",
      "transactions.*.ofiCustomerReferenceNumber.required":
        "(ofiCustomerReferenceNumber) is required.",
      "transactions.*.ofiCustomerReferenceNumber.string":
        "(ofiCustomerReferenceNumber) must be string.",
      "transactions.*.ofiCustomerReferenceNumber.max":
        "(ofiCustomerReferenceNumber) must not exceed 16 characters.",
      "transactions.*.rfiCustomerReferenceNumber.required":
        "(rfiCustomerReferenceNumber) is required.",
      "transactions.*.rfiCustomerReferenceNumber.string":
        "(rfiCustomerReferenceNumber) must be string.",
      "transactions.*.rfiCustomerReferenceNumber.max":
        "(rfiCustomerReferenceNumber) must not exceed 16 characters.",
      "transactions.*.instructions.required": "(instructions) is required.",
      "transactions.*.instructions.string": "(instructions) must be string.",
      "transactions.*.instructions.max":
        "(instructions) must not exceed 163 characters.",
    };
  }

  get sanitizationRules() {
    return {
      bicOfBank: "trim",
      "transactions.*.ofiReferenceNumber": "trim",
      "transactions.*.amount": "trim|moneyToString",
      "transactions.*.remitterName": "trim",
      "transactions.*.remitterAddress": "trim",
      "transactions.*.remitterAccountNumber": "trim",
      "transactions.*.remitterBIC": "trim",
      "transactions.*.beneficiaryName": "trim",
      "transactions.*.beneficiaryAddress": "trim",
      "transactions.*.beneficiaryAccountNumber": "trim",
      "transactions.*.beneficiaryBIC": "trim",
      "transactions.*.rfiReferenceNumber": "trim",
      "transactions.*.ofiCustomerReferenceNumber": "trim",
      "transactions.*.rfiCustomerReferenceNumber": "trim",
      "transactions.*.instructions": "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = APISendOutwardMessage;
