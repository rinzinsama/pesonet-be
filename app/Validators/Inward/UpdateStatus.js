"use strict";
const Serializer = use("Library/Validator/Serializer");

class InwardUpdateStatus {
  async authorize() {
    const user = this.ctx.auth.user;

    if (user.role_id != 2)
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
      referenceId: "required|string|exists:inward,reference_id|allowedStatus:inward,0,-2,-3",
      inward: "required|object",
    };
  }

  get messages() {
    return {
      "referenceId.required": "(referenceId) is required.",
      "referenceId.string": "(referenceId) must be a string.",
      "referenceId.exists": "(referenceId) does not exists.",
      "referenceId.allowedStatus": "(referenceId) invalid status.",
      "inward.required": "(inward) is required.",
      "inward.object": "(inward) must be an object.",
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

module.exports = InwardUpdateStatus;
