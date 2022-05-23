"use strict";
const Serializer = use("Library/Validator/Serializer");

class APIuploadCreds {
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
      certificate: "file|file_ext:pem,p12",
    };
  }

  get messages() {
    return {
      "certificate.file": "(certificate) must be a file.",
      "certificate.file_ext": "(certificate) extension must be (.pem or .p12).",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = APIuploadCreds;
