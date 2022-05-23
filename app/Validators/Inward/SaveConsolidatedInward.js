"use strict";
const Serializer = use("Library/Validator/Serializer");

class InwardSaveConsolidatedInward {
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
      settlementDate: "string|isDate",
      "transactions.*.remarks":
        "string|b64Regex:XihbYS16QS1aMC05XC9cLVw/OlwoXClcLiwnXCsgXSopJA==",
      type: "required|string|inStringArray:update,reject,send",
    };
  }

  get messages() {
    return {
      "settlementDate.string": "(date) must be string.",
      "settlementDate.isDate": "(date) format is incorrect..",
      "transactions.*.remarks.string": "(remarks) must be string.",
      "transactions.*.remarks.b64Regex":
        "(remarks) only alphanumeric characters, some special characters and spaces are allowed on this field.",
      "type.required": "(type) is required.",
      "type.string": "(type) must be a string.",
      "type.inStringArray": "(type) value is invalid.",
    };
  }

  get sanitizationRules() {
    return {
      settlementDate: "trim",
      "transactions.*.remarks": "trim",
      type: "trim|toLower",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = InwardSaveConsolidatedInward;
