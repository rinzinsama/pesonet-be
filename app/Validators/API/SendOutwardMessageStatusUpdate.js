"use strict";
const Serializer = use("Library/Validator/Serializer");

class APISendOutwardMessageStatusUpdate {
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
      sequenceNumber: "required|string",
    };
  }

  get messages() {
    return {
      "sequenceNumber.required": "(sequenceNumber) is required.",
      "sequenceNumber.string": "(sequenceNumber) must be string.",
    };
  }

  get sanitizationRules() {
    return {
      sequenceNumber: "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = APISendOutwardMessageStatusUpdate;
