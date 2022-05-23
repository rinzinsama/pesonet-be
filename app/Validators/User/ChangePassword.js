"use strict";
const Serializer = use("Library/Validator/Serializer");

class UserChangePassword {
  get validateAll() {
    return true;
  }

  get rules() {
    const user = this.ctx.auth.user;
    const newPassword = this.ctx.request.input("newPassword");

    return {
      oldPassword: `required|string|hashExists:users,password,reference_id,${user.reference_id}`,
      newPassword: `required|string|min:4|max:16|regex:^\\S*$,i|hashValueChanged,users,password,reference_id,${user.reference_id}`,
      repeatNewPassword: `required|string|notEqual:${newPassword}`
    };
  }

  get messages() {
    return {
      "oldPassword.required": "(oldPassword) is required.",
      "oldPassword.string": "(oldPassword) must be a string.",
      "oldPassword.hashExists": "Old password is incorrect.",
      "newPassword.required": "(newPassword) is required.",
      "newPassword.string": "(newPassword) must be a string.",
      "newPassword.min": "(newPassword) must be at least 4 characters.",
      "newPassword.max": "(newPassword) must not exceed 16 characters.",
      "newPassword.hashValueChanged": "Password value is the same as before.",
      "repeatNewPassword.required": "(repeatNewPassword) is required.",
      "repeatNewPassword.string": "(repeatNewPassword) must be a string.",
      "repeatNewPassword.notEqual":
        "(repeatNewPassword) does not match (newPassword)."
    };
  }

  get sanitizationRules() {
    return {
      oldPassword: "trim",
      password: "trim",
      repeatPassword: "trim"
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);
    return this.ctx.response.status(status).send(body);
  }
}

module.exports = UserChangePassword;
