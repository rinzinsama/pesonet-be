"use strict";
const Serializer = use("Library/Validator/Serializer");

class ModuleUpdateModule {
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
      id: `required|integer|exists:roles,id`,
      modules: "required|array|arrayExists:modules,module|arrayDuplicates",
      customValidation: "valuesChangedRole",
    };
  }

  get data() {
    const requestBody = this.ctx.request.all();

    return { customValidation: 1, ...requestBody };
  }

  get messages() {
    return {
      "id.required": "(id) is required.",
      "id.integer": "(id) must be an integer.",
      "id.exists": "(id) does not exists.",
      "modules.required": "Please select at least one module.",
      "modules.array": "(modules) must be an array.",
      "modules.arrayExists": "Some values in modules array does not exist.",
      "modules.arrayDuplicates": "Duplicated values in modules array.",
      "customValidation.valuesChangedRole": "No changes made.",
    };
  }

  get sanitizationRules() {
    return {
      referenceId: "trim",
      modules: "arrayToInt",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);
    return this.ctx.response.status(status).send(body);
  }
}

module.exports = ModuleUpdateModule;
