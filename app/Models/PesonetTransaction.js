"use strict";

const Model = use("Model");

class PesonetTransaction extends Model {
  static boot() {
    super.boot();

    this.addHook("afterSave", async (modelInstance) => {
      const Socket = use("Socket");

      Socket.broadcastData("PesonetTransaction", "save", {
        message: "New Entry",
      });
    });
  }

  static castDates(field, value) {
    return value.format("MMMM D, YYYY - h:mm:ss A");
  }

  userDetail() {
    return this.belongsTo("App/Models/User", "user", "username");
  }
}

module.exports = PesonetTransaction;
