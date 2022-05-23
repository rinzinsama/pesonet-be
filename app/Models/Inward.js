"use strict";

const Model = use("Model");

class Inward extends Model {
  static get table() {
    return "inward";
  }

  static boot() {
    super.boot();

    this.addHook("beforeCreate", "ReferenceIdHook.generateReferenceID");
    this.addHook("beforeCreate", (modelInstance) => {
      modelInstance.status = 0;
    });
    this.addHook("afterSave", async (modelInstance) => {
      const InwardService = use("App/Controllers/Services/Inward");
      const Socket = use("Socket");

      const { body } = await InwardService.getInwardMessage(modelInstance.reference_id);
    
      Socket.broadcastData("Inward", "save", {
        message: "New Entry",
        data: body.data,
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

module.exports = Inward;
