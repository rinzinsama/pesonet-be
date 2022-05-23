"use strict";
const Model = use("Model");

class StatusType extends Model {
  static boot() {
    super.boot();

    this.addHook("beforeCreate", "StatusHook.generateStatus");
  }

  static get hidden() {
    return ["status", "updated_at", "created_at"];
  }
}

module.exports = StatusType;
