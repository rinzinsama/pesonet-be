"use strict";

const Model = use("Model");

class FileReaderTransaction extends Model {
  static boot() {
    super.boot();

    this.addHook("beforeCreate", "ReferenceIdHook.generateReferenceID");
    this.addHook("afterSave", (modelInstance) => {
      const Socket = use("Socket");
      Socket.broadcastData("FileReader", "transactions", "New Data");
    });
  }

  static get hidden() {
    return ["id"];
  }

  static castDates(field, value) {
    return value.format("MMMM D, YYYY - h:mm:ss A");
  }
}

module.exports = FileReaderTransaction;
