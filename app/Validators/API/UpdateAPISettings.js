"use strict";
const Serializer = use("Library/Validator/Serializer");

class APIUpdateAPISettings {
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
      url: `required|string|b64Regex:Xig/Omh0dHAocyk/OlwvXC8pW1x3Li1dKyg/OlwuW1x3XC4tXSspK1tcd1wtXC5ffjovPyNbXF1AIVwkJidcKFwpXCpcKyw7PS5dKyR8aQ==`,
      path: "required|string",
      passphrase: `required|string|regex:^[a-z0-9]*$,i`,
      apiKey: `required|string|regex:^[a-z0-9]*$,i`,
      secretKey: `required|string|regex:^[a-z0-9]*$,i`,
      hasUpload: "required|integer|inInt:0,1",
    };
  }

  get messages() {
    return {
      "url.required": "(url) is required.",
      "url.string": "(url) must be a string.",
      "url.commaRegex": "(url) format is invalid.",
      "path.required": "(path) is required.",
      "path.string": "(path) must be a string.",
      "passphrase.required": "(passphrase) is required.",
      "passphrase.string": "(passphrase) must be a string.",
      "passphrase.regex": "(passphrase) must be letters and numbers.",
      "apiKey.required": "(apiKey) is required.",
      "apiKey.string": "(apiKey) must be a string.",
      "apiKey.regex": "(apiKey) must be letters and numbers.",
      "secretKey.required": "(secretKey) is required.",
      "secretKey.string": "(secretKey) must be a string.",
      "secretKey.regex": "(secretKey) must be letters and numbers.",
      "hasUpload.required": "(hasUpload) is required.",
      "hasUpload.integer": "(hasUpload) must be an integer.",
      "hasUpload.inInt": "(hasUpload) value is invalid.",
    };
  }

  get sanitizationRules() {
    return {
      url: "trim",
      path: "trim",
      passphrase: "trim",
      apiKey: "trim",
      secretKey: "trim",
      hasUpload: "trim|to_int",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);
    return this.ctx.response.status(status).send(body);
  }
}

module.exports = APIUpdateAPISettings;
