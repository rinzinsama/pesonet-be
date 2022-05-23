"use strict";
const Serializer = use("Library/Validator/Serializer");

class FileReaderGetLogsByDate {
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
      date: `required|string|isDate`,
    };
  }

  get messages() {
    return {
      "date.required": "(date) is required.",
      "date.string": "(date) must be string.",
      "date.isDate": "(date) format is incorrect.",
    };
  }

  get sanitizationRules() {
    return {
      date: "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = FileReaderGetLogsByDate;
