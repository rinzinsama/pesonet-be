"use strict";

const Model = use("Model");

class RoleModule extends Model {
  static get table() {
    return "role_module";
  }

  static get hidden() {
    return ["id"];
  }

  static castDates(field, value) {
    return value.format("MMMM D, YYYY - h:mm:ss A");
  }

  roles() {
    return this.hasMany("App/Models/Role", "id", "role_id");
  }

  modules() {
    return this.hasMany("App/Models/Module", "module", "module");
  }
}

module.exports = RoleModule;
