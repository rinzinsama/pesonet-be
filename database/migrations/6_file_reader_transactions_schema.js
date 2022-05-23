"use strict";

const Schema = use("Schema");

class FileReaderSchema extends Schema {
  up() {
    this.create("file_reader_transactions", (table) => {
      table.increments();

      table.string("reference_id", 15).notNullable().index();

      table.text("filename").notNullable();

      table.text("remarks").notNullable();

      table.integer("status").notNullable().index();

      table.timestamps();
    });
  }

  down() {
    this.drop("file_reader_transactions");
  }
}

module.exports = FileReaderSchema;
