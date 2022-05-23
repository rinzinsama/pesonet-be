"use strict";
const Serializer = use("Library/Validator/Serializer");

class InwardDownloadFile {
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
      referenceId: `required|string|exists:inward,reference_id`,
      type: "required|string|inStringArray:inward,tgs,hotscan",
    };
  }

  get messages() {
    return {
      "referenceId.required": "(referenceId) is required.",
      "referenceId.string": "(referenceId) must be a string.",
      "referenceId.exists": "(referenceId) does not exists.",

      "type.required": "(type) is required.",
      "type.string": "(type) must be a string.",
      "type.inStringArray": "(type) value is invalid.",
    };
  }

  get sanitizationRules() {
    return {
      referenceId: "trim",
      type: "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = InwardDownloadFile;
