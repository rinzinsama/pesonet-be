"use strict";
const Serializer = use("Library/Validator/Serializer");

class ModuleGetModules {
  async authorize() {
    const user = this.ctx.auth.user;

    if (user.role_id != 1)
      return this.ctx.response.status(403).json({
        message: "You are not allowed access this method."
      });

    return true;
  }

  get validateAll() {
    return true;
  }

  get rules() {
    return {
      status: "integer|inInt:1,0"
    };
  }

  get messages() {
    return {
      "status.integer": "(status) must be integer.",
      "status.inInt": "(status) value is invalid."
    };
  }

  get sanitizationRules() {
    return {
      status: "trim|to_int"
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);
    return this.ctx.response.status(status).send(body);
  }
}

module.exports = ModuleGetModules;
