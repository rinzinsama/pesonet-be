"use strict";

const Schema = use("Schema");

class PesonetTransactionsSchema extends Schema {
  up() {
    this.create("pesonet_transactions", (table) => {
      table.increments();

      table.integer("transaction_id").notNullable();

      table.string("user").notNullable();

      table.string("type").notNullable();

      table.text("remarks", "longtext").notNullable();
      
      table.timestamps();
    });
  }

  down() {
    this.drop("pesonet_transactions");
  }
}

module.exports = PesonetTransactionsSchema;
