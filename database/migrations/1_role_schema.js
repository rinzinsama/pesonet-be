"use strict";

const Schema = use("Schema");
const Database = use("Database");

class RoleSchema extends Schema {
  up() {
    this.create("roles", (table) => {
      table.increments();

      table.string("role", 250).notNullable();

      table.integer("status").notNullable().index();

      table.timestamps();
    });
  }

  down() {
    this.drop("roles");
  }
}

module.exports = RoleSchema;
