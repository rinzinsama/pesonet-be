"use strict";

const Schema = use("Schema");

class StatusListSchema extends Schema {
  up() {
    this.create("status_lists", (table) => {
      table.increments();

      table.string("reference_id", 15).notNullable().index();

      table.string("status_code").notNullable().unique();

      table.text("status_name").notNullable();

      table.text("description", "longtext").notNullable();

      table.integer("type").unsigned().references("id").inTable("status_types");

      table.integer("status").notNullable().index();

      table.timestamps();
    });
  }

  down() {
    this.drop("status_lists");
  }
}

module.exports = StatusListSchema;
