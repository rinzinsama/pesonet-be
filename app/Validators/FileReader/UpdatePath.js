"use strict";
const Serializer = use("Library/Validator/Serializer");
const FileReader = use("FileReader");

class FileReaderUpdatePath {
  async authorize() {
    const user = this.ctx.auth.user;

    if (user.role_id != 1)
      return this.ctx.response.status(403).json({
        message: "You are not allowed access this method."
      });

    return true;
  }

  constructor() {
    this.path = FileReader.getPath();
  }

  get validateAll() {
    return true;
  }

  get rules() {
    return {
      path: `required|string|equals:${this.path}|folderExists`
    };
  }

  get messages() {
    return {
      "path.required": "(path) is required.",
      "path.string": "(path) must be string.",
      "path.equals": "(path) must not be the same path name.",
      "path.folderExists": "Path does not exists."
    };
  }

  get sanitizationRules() {
    return {
      path: "trim"
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = FileReaderUpdatePath;
