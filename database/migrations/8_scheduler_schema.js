"use strict";

const Schema = use("Schema");

class SchedulerSchema extends Schema {
  up() {
    this.create("scheduler", (table) => {
      table.increments();

      table.string("reference_id", 15).notNullable().index();

      table.text("description").notNullable();

      table.string("type").notNullable().index();

      table.string("status").notNullable().index();

      table.timestamps();
    });
  }

  down() {
    this.drop("scheduler");
  }
}

module.exports = SchedulerSchema;
