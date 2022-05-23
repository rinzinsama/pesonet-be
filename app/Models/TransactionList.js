"use strict";

const Model = use("Model");

class TransactionList extends Model {
  static boot() {
    super.boot();

    this.addHook("beforeCreate", "ReferenceIdHook.generateReferenceID");
    this.addHook("afterSave", async (modelInstance) => {
      const Socket = use("Socket");

      Socket.broadcastData("TransactionList", "save", {
        message: "New Entry",
      });
    });
  }

  static get hidden() {
    return ["id"];
  }

  static castDates(field, value) {
    return field == "settlement_date"
      ? value.format("MMMM D, YYYY")
      : value.format("MMMM D, YYYY - h:mm:ss A");
  }

  static get dates() {
    return super.dates.concat(["settlement_date"]);
  }

  static formatDates(field, value) {
    return field === "settlement_date"
      ? value
      : super.formatDates(field, value);
  }
}

module.exports = TransactionList;
