"use strict";
const Serializer = use("Library/Validator/Serializer");

class OutwardSaveOutwardMessage {
  async authorize() {
    const user = this.ctx.auth.user;

    if (user.role_id != 3)
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
      referenceId:
        "required|string|exists:outward,reference_id|allowedStatus:outward,0,1",
      bicOfBank:
        "required|string|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==|isBankBic",

      "transactions.*.ofiReferenceNumber":
        "required|string|max:35|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",

      "transactions.*.amount":
        "required|string|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",

      "transactions.*.remitterName":
        "required|string|max:50|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",

      "transactions.*.remitterAddress":
        "required|string|max:200|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",

      "transactions.*.remitterAccountNumber":
        "required|string|max:35|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",

      "transactions.*.remitterBIC":
        "required|string|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",

      "transactions.*.beneficiaryName":
        "required|string|max:50|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",

      "transactions.*.beneficiaryAddress":
        "string|max:200|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",

      "transactions.*.beneficiaryAccountNumber":
        "required|string|max:35|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",

      "transactions.*.beneficiaryBIC":
        "required|string|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==|inBank",

      "transactions.*.rfiReferenceNumber":
        "string|max:35|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",

      "transactions.*.ofiCustomerReferenceNumber":
        "string|max:35|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",

      "transactions.*.rfiCustomerReferenceNumber":
        "string|max:35|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",

      "transactions.*.instructions":
        "required|string|max:200|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",
    };
  }

  get messages() {
    return {
      "referenceId.required": "(referenceId) is required.",
      "referenceId.string": "(referenceId) must be a string.",
      "referenceId.exists": "(referenceId) does not exists.",
      "referenceId.allowedStatus": "(referenceId) invalid status.",
      "bicOfBank.required": "(bicOfBank) is required.",
      "bicOfBank.string": "(bicOfBank) must be string.",
      "bicOfBank.b64Regex":
        "(bicOfBank) only alphanumeric characters, some special characters and spaces are allowed on this field.",
      "bicOfBank.isBankBic": "(bicOfBank) BIC of bank is incorrect.",

      "transactions.*.ofiReferenceNumber.required":
        "(ofiReferenceNumber) is required.",
      "transactions.*.ofiReferenceNumber.string":
        "(ofiReferenceNumber) must be string.",
      "transactions.*.ofiReferenceNumber.max":
        "(ofiReferenceNumber) must not exceed 35 characters.",
      "transactions.*.ofiReferenceNumber.b64Regex":
        "(ofiReferenceNumber) only alphanumeric characters, some special characters and spaces are allowed on this field.",

      "transactions.*.amount.required": "(amount) is required.",
      "transactions.*.amount.string": "(amount) must be string.",
      "transactions.*.amount.b64Regex":
        "(amount) only alphanumeric characters, some special characters and spaces are allowed on this field.",

      "transactions.*.remitterName.required": "(remitterName) is required.",
      "transactions.*.remitterName.string": "(remitterName) must be string.",
      "transactions.*.remitterName.max":
        "(remitterName) must not exceed 50 characters.",
      "transactions.*.remitterName.b64Regex":
        "(remitterName) only alphanumeric characters, some special characters and spaces are allowed on this field.",

      "transactions.*.remitterAddress.required":
        "(remitterAddress) is required.",
      "transactions.*.remitterAddress.string":
        "(remitterAddress) must be string.",
      "transactions.*.remitterAddress.max":
        "(remitterAddress) must not exceed 200 characters.",
      "transactions.*.remitterAddress.b64Regex":
        "(remitterAddress) only alphanumeric characters, some special characters and spaces are allowed on this field.",

      "transactions.*.remitterAccountNumber.required":
        "(remitterAccountNumber) is required.",
      "transactions.*.remitterAccountNumber.string":
        "(remitterAccountNumber) must be string.",
      "transactions.*.remitterAccountNumber.max":
        "(remitterAccountNumber) must not exceed 35 characters.",
      "transactions.*.remitterAccountNumber.b64Regex":
        "(remitterAccountNumber) only alphanumeric characters, some special characters and spaces are allowed on this field.",

      "transactions.*.remitterBIC.required": "(remitterBIC) is required.",
      "transactions.*.remitterBIC.string": "(remitterBIC) must be string.",
      "transactions.*.remitterBIC.b64Regex":
        "(remitterBIC) only alphanumeric characters, some special characters and spaces are allowed on this field.",

      "transactions.*.beneficiaryName.required":
        "(beneficiaryName) is required.",
      "transactions.*.beneficiaryName.string":
        "(beneficiaryName) must be string.",
      "transactions.*.beneficiaryName.max":
        "(beneficiaryName) must not exceed 50 characters.",
      "transactions.*.beneficiaryName.b64Regex":
        "(beneficiaryName) only alphanumeric characters, some special characters and spaces are allowed on this field.",

      "transactions.*.beneficiaryAddress.string":
        "(beneficiaryAddress) must be string.",
      "transactions.*.beneficiaryAddress.max":
        "(beneficiaryAddress) must not exceed 200 characters.",
      "transactions.*.beneficiaryAddress.b64Regex":
        "(beneficiaryAddress) only alphanumeric characters, some special characters and spaces are allowed on this field.",

      "transactions.*.beneficiaryAccountNumber.required":
        "(beneficiaryAccountNumber) is required.",
      "transactions.*.beneficiaryAccountNumber.string":
        "(beneficiaryAccountNumber) must be string.",
      "transactions.*.beneficiaryAccountNumber.max":
        "(beneficiaryAccountNumber) must not exceed 35 characters.",
      "transactions.*.beneficiaryAccountNumber.b64Regex":
        "(beneficiaryAccountNumber) only alphanumeric characters, some special characters and spaces are allowed on this field.",

      "transactions.*.beneficiaryBIC.required": "(beneficiaryBIC) is required.",
      "transactions.*.beneficiaryBIC.string":
        "(beneficiaryBIC) must be string.",
      "transactions.*.beneficiaryBIC.b64Regex":
        "(beneficiaryBIC) only alphanumeric characters, some special characters and spaces are allowed on this field.",
      "transactions.*.beneficiaryBIC.inBank":
        "(beneficiaryBIC) Bank does not exist.",

      "transactions.*.rfiReferenceNumber.string":
        "(rfiReferenceNumber) must be string.",
      "transactions.*.rfiReferenceNumber.max":
        "(rfiReferenceNumber) must not exceed 35 characters.",
      "transactions.*.rfiReferenceNumber.b64Regex":
        "(rfiReferenceNumber) only alphanumeric characters, some special characters and spaces are allowed on this field.",

      "transactions.*.ofiCustomerReferenceNumber.string":
        "(ofiCustomerReferenceNumber) must be string.",
      "transactions.*.ofiCustomerReferenceNumber.max":
        "(ofiCustomerReferenceNumber) must not exceed 35 characters.",
      "transactions.*.ofiCustomerReferenceNumber.b64Regex":
        "(ofiCustomerReferenceNumber) only alphanumeric characters, some special characters and spaces are allowed on this field.",

      "transactions.*.rfiCustomerReferenceNumber.string":
        "(rfiCustomerReferenceNumber) must be string.",
      "transactions.*.rfiCustomerReferenceNumber.max":
        "(rfiCustomerReferenceNumber) must not exceed 35 characters.",
      "transactions.*.rfiCustomerReferenceNumber.b64Regex":
        "(rfiCustomerReferenceNumber) only alphanumeric characters, some special characters and spaces are allowed on this field.",

      "transactions.*.instructions.required": "(instructions) is required.",
      "transactions.*.instructions.string": "(instructions) must be string.",
      "transactions.*.instructions.max":
        "(instructions) must not exceed 200 characters.",
      "transactions.*.instructions.b64Regex":
        "(instructions) only alphanumeric characters, some special characters and spaces are allowed on this field.",
    };
  }

  get sanitizationRules() {
    return {
      referenceId: "trim",
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

module.exports = OutwardSaveOutwardMessage;
