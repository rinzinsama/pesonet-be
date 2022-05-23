"use strict";

const Schema = use("Schema");

class OutwardSchema extends Schema {
  up() {
    this.create("outward", (table) => {
      table.increments();

      table.string("reference_id", 15).notNullable().index();

      table.text("sequence_number");

      table.text("settlement_date");

      table.string("number_of_transaction");

      table.string("total_amount");

      table.text("remarks", "longtext");

      table.integer("number_of_batch").notNullable().index();

      table.integer("status").notNullable().index();

      table.text("local_external_code");

      table.integer("processing").index();

      table.integer("is_sent").notNullable().index();

      table.timestamps();
    });
  }

  down() {
    this.drop("outward");
  }
}

module.exports = OutwardSchema;
