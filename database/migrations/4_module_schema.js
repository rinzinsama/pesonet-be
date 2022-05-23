"use strict";

const Schema = use("Schema");

class ModuleSchema extends Schema {
  up() {
    this.create("modules", (table) => {
      table.increments();

      table.integer("module").notNullable().unique().index();

      table.string("description", 250).notNullable();

      table.integer("status").notNullable().index();

      table.timestamps();
    });
  }

  down() {
    this.drop("modules");
  }
}

module.exports = ModuleSchema;
