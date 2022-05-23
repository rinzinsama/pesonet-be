"use strict";
const Serializer = use("Library/Validator/Serializer");

class ModuleGetRoleModules {
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
      id: `required|integer|exists:roles,id`
    };
  }

  get messages() {
    return {
      "id.required": "(id) is required.",
      "id.integer": "(id) must be an integer.",
      "id.exists": "(id) does not exists."
    };
  }

  get sanitizationRules() {
    return {
      id: "trim|to_int"
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);
    return this.ctx.response.status(status).send(body);
  }
}

module.exports = ModuleGetRoleModules;
