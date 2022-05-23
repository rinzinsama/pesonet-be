"use strict";

const Schema = use("Schema");

class ApiTransactionsSchema extends Schema {
  up() {
    this.create("api_transactions", (table) => {
      table.increments();

      table.string("reference_id", 15).notNullable().index();

      table.string("sent_by").notNullable();

      table.text("endpoint").notNullable();

      table.text("log").notNullable();

      table.timestamps();
    });
  }

  down() {
    this.drop("api_transactions");
  }
}

module.exports = ApiTransactionsSchema;
