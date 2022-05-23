"use strict";
const Serializer = use("Library/Validator/Serializer");
class AuthenticationLogin {
  get validateAll() {
    return true;
  }

  get rules() {
    return {
      username: "required|string",
      password: "required|string"
    };
  }

  get messages() {
    return {
      "username.required": "(username) is required.",
      "username.string": "(username) must be a string.",
      "password.required": "(password) is required.",
      "password.string": "(password) must be a string."
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);
    return this.ctx.response.status(status).send(body);
  }
}

module.exports = AuthenticationLogin;
