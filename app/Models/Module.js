"use strict";

const Model = use("Model");

class Module extends Model {
  static boot() {
    super.boot();

    this.addHook("beforeCreate", "StatusHook.generateStatus");
  }

  static get hidden() {
    return ["id", "updated_at", "created_at"];
  }

  roles() {
    return this.belongsToMany(
      "App/Models/Role",
      "module",
      "role_id",
      "module",
      "id"
    ).pivotTable("role_module");
  }
}

module.exports = Module;
