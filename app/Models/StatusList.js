"use strict";
const Model = use("Model");

class StatusList extends Model {
  static boot() {
    super.boot();

    this.addHook("beforeCreate", "ReferenceIdHook.generateReferenceID");
    this.addHook("beforeCreate", "StatusHook.generateStatus");
    this.addHook("afterSave", async (modelInstance) => {
      const StatusListService = use("App/Controllers/Services/StatusList");
      const Socket = use("Socket");

      const { body } = await StatusListService.getList(
        modelInstance.reference_id
      );

      Socket.broadcastData("StatusList", "save", {
        message: "New Entry",
        data: body.data,
      });
    });
  }

  static castDates(field, value) {
    return value.format("MMMM D, YYYY - h:mm:ss A");
  }

  statusType() {
    return this.belongsTo("App/Models/StatusType", "type", "id");
  }
}

module.exports = StatusList;
