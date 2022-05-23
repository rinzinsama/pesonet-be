"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class StatusTypeSchema extends Schema {
  up() {
    this.create("status_types", (table) => {
      table.increments();

      table.string("type").notNullable();

      table.integer("status").notNullable().index();

      table.timestamps();
    });
  }

  down() {
    this.drop("status_types");
  }
}

module.exports = StatusTypeSchema;
