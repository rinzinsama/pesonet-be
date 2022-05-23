"use strict";

const Model = use("Model");

class User extends Model {
  static boot() {
    super.boot();

    this.addHook("beforeCreate", "ReferenceIdHook.generateReferenceID");
    this.addHook("beforeCreate", "UserHook.upperCaseUsername");
    this.addHook("beforeCreate", "UserHook.defaultMiddleName");
    this.addHook("beforeCreate", "UserHook.defaultIsPasswordChanged");
    this.addHook("beforeCreate", "UserHook.defaultIsPassword");
    this.addHook("beforeCreate", "StatusHook.generateStatus");
    this.addHook("beforeSave", "UserHook.hashPassword");
    this.addHook("afterSave", async (modelInstance) => {
      const UserService = use("App/Controllers/Services/User");
      const Socket = use("Socket");

      const { body } = await UserService.getUser(modelInstance.reference_id);

      Socket.broadcastData("UserManagement", "save", {
        message: "New Entry",
        data: body.data,
      });
    });
  }

  static get hidden() {
    return ["id", "password"];
  }

  static get computed() {
    return ["fullname"];
  }

  getFullname({ first_name, middle_name, last_name }) {
    let fullname =
      middle_name.trim().length == 0
        ? `${first_name} ${last_name}`
        : `${first_name} ${middle_name} ${last_name}`;

    return fullname;
  }

  static castDates(field, value) {
    return value.format("MMMM D, YYYY - h:mm:ss A");
  }

  sessions() {
    return this.hasMany("App/Models/Session", "id", "user_id");
  }

  role() {
    return this.belongsTo("App/Models/Role", "role_id", "id");
  }
}

module.exports = User;
