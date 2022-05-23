"use strict";
const Serializer = use("Library/Validator/Serializer");

class APISendIndex {
  async authorize() {
    const user = this.ctx.auth.user;

    if (![1, 2].includes(+user.role_id))
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
      cycle: "required|integer",
      settlementDate: "required|string|isDate",
    };
  }

  get messages() {
    return {
      "cycle.required": "(cycle) is required.",
      "cycle.integer": "(cycle) must be an integer.",
      "settlementDate.required": "(settlementDate) is required.",
      "settlementDate.string": "(settlementDate) must be string.",
      "settlementDate.isDate": "(settlementDate) format is incorrect.",
    };
  }

  get sanitizationRules() {
    return {
      cycle: "trim|to_int",
      settlementDate: "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = APISendIndex;
