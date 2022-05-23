"use strict";
const Serializer = use("Library/Validator/Serializer");

class StatusListCreateStatus {
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
      statusCode: `required|string|unique:status_lists,status_code`,
      statusName: `required|string|unique:status_lists,status_name`,
      description: "required|string",
      type: "required|integer|inFilter:status_types,id",
    };
  }

  get messages() {
    return {
      "statusCode.required": "(statusCode) is required.",
      "statusCode.string": "(statusCode) must be a string.",
      "statusCode.unique": "(statusCode) already exist.",
      "statusName.required": "(statusName) is required.",
      "statusName.string": "(statusName) must be a string.",
      "statusName.unique": "(statusName) already exist.",
      "description.required": "(description) is required.",
      "description.string": "(description) must be a string.",
      "roleId.required": "(roleId) is required.",
      "type.integer": "(type) must be an integer.",
      "type.inFilter": "(type) value is invalid.",
    };
  }

  get sanitizationRules() {
    return {
      statusCode: "trim",
      statusName: "trim",
      description: "trim",
      type: "trim|to_int",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);
    return this.ctx.response.status(status).send(body);
  }
}

module.exports = StatusListCreateStatus;
