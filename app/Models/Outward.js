"use strict";

const Model = use("Model");

class Outward extends Model {
  static get table() {
    return "outward";
  }

  static boot() {
    super.boot();

    this.addHook("beforeCreate", "OutwardHook.defaultStatus");
    this.addHook("beforeCreate", "OutwardHook.defaultReferenceId");
    this.addHook("beforeCreate", "OutwardHook.defaultSequenceNumber");
    this.addHook("beforeCreate", "OutwardHook.defaultSettlementDate");
    this.addHook("beforeCreate", "OutwardHook.defaultNumberOfBatch");
    this.addHook("beforeCreate", "OutwardHook.defaultIsSent");
    this.addHook("beforeCreate", "OutwardHook.defaultLocalExternalCode");
    this.addHook("beforeCreate", "OutwardHook.defaultProcessing");
    this.addHook("afterSave", async (modelInstance) => {
      const OutwardService = use("App/Controllers/Services/Outward");
      const Socket = use("Socket");

      const { body } = await OutwardService.getOutwardMessage(
        modelInstance.reference_id
      );

      Socket.broadcastData("Outward", "save", {
        message: "New Entry",
        data: body.data,
      });
    });
  }

  static get hidden() {
    return ["id"];
  }

  getSettlementDate(settlement_date) {
    if (!settlement_date) return settlement_date;

    const extractDate = settlement_date.split(" - ");

    return [...new Set(extractDate)].join(" - ");
  }

  static castDates(field, value) {
    return value.format("MMMM D, YYYY - h:mm:ss A");
  }
}

module.exports = Outward;
