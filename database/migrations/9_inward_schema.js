"use strict";

const Schema = use("Schema");

class InwardSchema extends Schema {
  up() {
    this.create("inward", (table) => {
      table.increments();

      table.string("reference_id", 15).notNullable().index();

      table.string("sequence_number").notNullable().unique();

      table.string("cycle").notNullable().index();

      table.date("settlement_date").notNullable().index();

      table.string("number_of_transaction");

      table.string("total_amount");

      table.text("remarks", "longtext");

      table.integer("status").notNullable().index();

      table.timestamps();
    });
  }

  down() {
    this.drop("inward");
  }
}

module.exports = InwardSchema;
