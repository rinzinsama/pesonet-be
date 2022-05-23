"use strict";
const Serializer = use("Library/Validator/Serializer");

class StatusListUpdateStatus {
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
    let { referenceId } = this.ctx.request.all();

    return {
      referenceId: `required|string|exists:status_lists,reference_id`,
      statusCode: `string|unique:status_lists,status_code,reference_id,${referenceId}`,
      statusName: `string|unique:status_lists,status_name,reference_id,${referenceId}`,
      description: "string",
      type: "integer|inFilter:status_types,id",
      status: "integer|inInt:0,1",
      isChanged: "valuesChanged:status_lists",
    };
  }

  get data() {
    const requestBody = this.ctx.request.all();

    return { isChanged: 1, ...requestBody };
  }

  get messages() {
    return {
      "referenceId.required": "(referenceId) is required.",
      "referenceId.string": "(referenceId) must be a string.",
      "referenceId.exists": "(referenceId) does not exists.",
      "statusCode.required": "(statusCode) is required.",
      "statusCode.string": "(statusCode) must be a string.",
      "statusCode.unique": "(statusCode) already exist.",
      "statusName.required": "(statusName) is required.",
      "statusName.string": "(statusName) must be a string.",
      "statusName.unique": "(statusName) already exist.",
      "description.string": "(description) must be a string.",
      "type.integer": "(type) must be an integer.",
      "type.inFilter": "(type) value is invalid.",
      "status.integer": "(status) must be an integer.",
      "status.inInt": "(status) value is invalid.",
      "isChanged.valuesChanged": "No changes made.",
    };
  }

  get sanitizationRules() {
    return {
      referenceId: "trim",
      statusCode: "trim",
      statusName: "trim",
      description: "trim",
      type: "trim|to_int",
      status: "trim|to_int",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);
    return this.ctx.response.status(status).send(body);
  }
}

module.exports = StatusListUpdateStatus;
