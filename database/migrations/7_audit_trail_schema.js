"use strict";

const Schema = use("Schema");

class AuditTrailSchema extends Schema {
  up() {
    this.create("audit_trails", (table) => {
      table.increments();

      table.string("reference_id", 15).notNullable().index();

      table.string("username").notNullable();

      table.string("ip");

      table.text("url").notNullable();

      table.string("module").notNullable();

      table.string("method").notNullable();

      table.text("log").notNullable();

      table.timestamps();
    });
  }

  down() {
    this.drop("audit_trails");
  }
}

module.exports = AuditTrailSchema;
