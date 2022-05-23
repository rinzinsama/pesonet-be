"use strict";
const Serializer = use("Library/Validator/Serializer");

class BankListUpdateBank {
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
      bic: `required|string|inBank|sameBank`,
    };
  }

  get messages() {
    return {
      "bic.required": "(bic) is required.",
      "bic.string": "(bic) must be a string.",
      "bic.inBank": "(bic) does not exist.",
      "bic.sameBank": "No changes made.",
    };
  }

  get sanitizationRules() {
    return {
      bic: "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = BankListUpdateBank;
