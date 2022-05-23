"use strict";

const Schema = use("Schema");

class SessionSchema extends Schema {
  up() {
    this.create("sessions", (table) => {
      table.increments();

      table.integer("user_id").unsigned().references("id").inTable("users");

      table.text("token", "longtext").notNullable();

      table.timestamps();
    });
  }

  down() {
    this.drop("sessions");
  }
}

module.exports = SessionSchema;
