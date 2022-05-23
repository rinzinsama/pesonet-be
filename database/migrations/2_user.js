"use strict";

const Schema = use("Schema");

class UserSchema extends Schema {
  up() {
    this.create("users", (table) => {
      table.increments();

      table.string("reference_id", 15).notNullable().index();

      table.string("username", 16).notNullable().unique();

      table.string("first_name", 50).notNullable();

      table.string("middle_name", 50);

      table.string("last_name", 50).notNullable();

      table.string("email", 50).notNullable().unique();

      table.string("password").notNullable();

      table.integer("is_password_changed").notNullable().index();

      table.integer("role_id").unsigned().references("id").inTable("roles");

      table.integer("status").notNullable().index();

      table.timestamps();
    });
  }

  down() {
    this.drop("users");
  }
}

module.exports = UserSchema;
