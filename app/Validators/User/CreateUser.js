"use strict";
const Serializer = use("Library/Validator/Serializer");

class CreateUser {
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
      username: `required|string|min:4|max:16|regex:^(?![\\._])[A-Z0-9]*([\\._]?[A-Z0-9])*$,g|unique:users,username`,
      firstName: "required|string|min:1|max:50",
      lastName: "required|string|min:1|max:50",
      middleName: "string|min:1|max:50",
      email: `required|email|unique:users,email`,
      roleId: "required|integer|inFilter:roles,id"
    };
  }

  get messages() {
    return {
      "username.required": "(username) is required.",
      "username.string": "(username) must be a string.",
      "username.min": "(username) must be at least 4 characters long.",
      "username.max": "(username) must not exceed 16 characters long.",
      "username.regex":
        "(username) allowed characters are letters, numbers, (underscore and dot in between characters).",
      "username.unique": "(username) already exist.",
      "firstName.required": "(firstName) is required.",
      "firstName.string": "(firstName) must be a string.",
      "firstName.min": "(firstName) must be at least 1 character long.",
      "firstName.max": "(firstName) must not exceed 50 characters long.",
      "lastName.required": "(lastName) is required.",
      "lastName.string": "(lastName) must be a string.",
      "lastName.min": "(lastName) must be at least 1 character long.",
      "lastName.max": "(lastName) must not exceed 50 characters long.",
      "middleName.string": "(middleName) must be a string.",
      "middleName.min": "(middleName) must be at least 1 character long.",
      "middleName.max": "(middleName) must not exceed 50 characters long.",
      "email.required": "(email) is required.",
      "email.email": "(email) must be in email format.",
      "email.unique": "(email) already exist.",
      "roleId.required": "(roleId) is required.",
      "roleId.integer": "(roleId) must be an integer.",
      "roleId.inFilter": "(roleId) value is invalid."
    };
  }

  get sanitizationRules() {
    return {
      username: "trim|toUpper",
      firstName: "trim",
      lastName: "trim",
      middleName: "trim",
      email: "trim",
      roleId: "trim|to_int"
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);
    return this.ctx.response.status(status).send(body);
  }
}

module.exports = CreateUser;
