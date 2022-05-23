"use strict";

const Model = use("Model");

class Role extends Model {
  static boot() {
    super.boot();

    this.addHook("beforeCreate", "StatusHook.generateStatus");
  }

  static get hidden() {
    return ["status", "updated_at", "created_at"];
  }

  users() {
    return this.hasMany("App/Models/Role", "id", "user_id");
  }

  modules() {
    return this.belongsToMany(
      "App/Models/Module",
      "role_id",
      "module",
      "id",
      "module"
    ).pivotTable("role_module");
  }

  roleModules() {
    return this.hasMany("App/Models/RoleModule", "id", "role_id");
  }
}

module.exports = Role;
