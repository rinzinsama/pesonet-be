"use strict";
const Serializer = use("Library/Validator/Serializer");

class AuthenticationCheckUsername {
  get validateAll() {
    return true;
  }

  get rules() {
    return {
      username: "required|string"
    };
  }

  get messages() {
    return {
      "username.required": "(username) is required.",
      "username.string": "(username) must be a string."
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);
    return this.ctx.response.status(status).send(body);
  }
}

module.exports = AuthenticationCheckUsername;
