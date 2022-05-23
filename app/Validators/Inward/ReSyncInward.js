"use strict";
const Serializer = use("Library/Validator/Serializer");

class InwardReSyncInward {
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
    };
  }

  get messages() {
    return {
      "settlementDate.string": "(date) must be string.",
      "settlementDate.isDate": "(date) format is incorrect..",
    };
  }

  get sanitizationRules() {
    return {
      settlementDate: "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = InwardReSyncInward;
