"use strict";
const Serializer = use("Library/Validator/Serializer");

class UserUpdateUser {
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
    let { referenceId } = this.ctx.request.all();

    return {
      referenceId: `required|string|exists:users,reference_id`,
      firstName: "string|min:1|max:50",
      lastName: "string|min:1|max:50",
      middleName: "string|min:1|max:50",
      email: `email|unique:users,email,reference_id,${referenceId}`,
      roleId: "integer|inFilter:roles,id",
      status: "integer|inInt:0,1",
      isChanged: "valuesChanged:users"
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
      "firstName.string": "(firstName) must be a string.",
      "firstName.min": "(firstName) must be at least 1 character.",
      "firstName.max": "(firstName) must not exceed 50 characters.",
      "lastName.string": "(lastName) must be a string.",
      "lastName.min": "(lastName) must be at least 1 character.",
      "lastName.max": "(lastName) must not exceed 50 characters.",
      "middleName.string": "(middleName) must be a string.",
      "middleName.min": "(middleName) must be at least 1 character.",
      "middleName.max": "(middleName) must not exceed 50 characters.",
      "email.email": "(email) must be in email format.",
      "email.unique": "(email) already exist.",
      "roleId.integer": "(roleId) must be an integer.",
      "roleId.inFilter": "(roleId) value is invalid.",
      "status.integer": "(status) must be an integer.",
      "status.inInt": "(status) value is invalid.",
      "isChanged.valuesChanged": "No changes made."
    };
  }

  get sanitizationRules() {
    return {
      referenceId: "trim",
      firstName: "trim",
      lastName: "trim",
      middleName: "trim",
      email: "trim",
      roleId: "trim|to_int",
      status: "trim|to_int"
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);
    return this.ctx.response.status(status).send(body);
  }
}

module.exports = UserUpdateUser;
