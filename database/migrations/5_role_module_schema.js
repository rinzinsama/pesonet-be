"use strict";

const Schema = use("Schema");

class RoleModuleSchema extends Schema {
  up() {
    this.create("role_module", (table) => {
      table.increments();

      table.integer("role_id").unsigned();

      table.integer("module");

      table.timestamps();
    });
  }

  down() {
    this.drop("role_module");
  }
}

module.exports = RoleModuleSchema;
