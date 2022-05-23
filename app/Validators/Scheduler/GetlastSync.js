"use strict";
const Serializer = use("Library/Validator/Serializer");

class SchedulerGetlastSync {
  async authorize() {
    const user = this.ctx.auth.user;

    if (![1, 2, 3].includes(+user.role_id))
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
      type: "string|inStringArray:SYNC BANK LIST,SYNC INWARD,SYNC OUTWARD,OUTWARD MESSAGE",
    };
  }

  get messages() {
    return {
      "type.string": "(type) must be string.",
      "type.inStringArray": "(type) value is invalid.",
    };
  }

  get sanitizationRules() {
    return {
      type: "trim|toUpper",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = SchedulerGetlastSync;
