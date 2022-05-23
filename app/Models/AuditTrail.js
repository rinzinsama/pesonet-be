"use strict";

const Model = use("Model");

class AuditTrail extends Model {
  static boot() {
    super.boot();

    this.addHook("beforeCreate", "ReferenceIdHook.generateReferenceID");
    this.addHook("afterSave", async (modelInstance) => {
      if (modelInstance.module != "AUDIT") {
        const Socket = use("Socket");

        Socket.broadcastData("AuditTrail", "save", {
          message: "New Entry",
        });
      }
    });
  }

  static get hidden() {
    return ["id"];
  }

  static castDates(field, value) {
    return value.format("MMMM D, YYYY - h:mm:ss A");
  }

  user() {
    return this.belongsTo("App/Models/User", "user_id", "id");
  }
}

module.exports = AuditTrail;
