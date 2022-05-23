"use strict";
const BaseService = use("App/Controllers/Services/Base");
const Drive = use("Drive");
const Helpers = use("Helpers");
const Socket = use("Socket");

class BankListService {
  static async getBankList() {
    const list = (
      await Drive.get(Helpers.tmpPath("bank_list/list.json"))
    ).toString();

    return BaseService.withDataResponseSerializer(JSON.parse(list));
  }

  static async updateBank(bic) {
    await Drive.put(Helpers.tmpPath("bank.txt"), bic);

    Socket.broadcastData("BankList", "update", {
      message: "New Entry",
      data: bic,
    });

    return BaseService.noDataResponseSerializer(
      "Successfully updated bank details.",
      200
    );
  }

  static async getBankBIC() {
    const bic = await Drive.get(Helpers.tmpPath("bank.txt"));

    return BaseService.withDataResponseSerializer(bic.toString());
  }
}

module.exports = BankListService;
