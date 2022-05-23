"use strict";
const Serializer = use("Library/Validator/Serializer");

class OutwardGetTransactionsRaw {
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
      referenceId: "required|string|exists:outward,reference_id",
    };
  }

  get messages() {
    return {
      "referenceId.required": "(referenceId) is required.",
      "referenceId.string": "(referenceId) must be a string.",
      "referenceId.exists": "(referenceId) does not exists.",
    };
  }

  get sanitizationRules() {
    return {
      referenceId: "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);
    return this.ctx.response.status(status).send(body);
  }
}

module.exports = OutwardGetTransactionsRaw;
