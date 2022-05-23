"use strict";
const BankListService = use("App/Controllers/Services/BankList");

class BankListController {
  async getBankList({ response }) {
    const { status, body } = await BankListService.getBankList();

    return response.status(status).send(body);
  }

  async updateBank({ response, request }) {
    const { status, body } = await BankListService.updateBank(
      request.input("bic")
    );

    return response.status(status).send(body);
  }

  async getBankBIC({ response }) {
    const { status, body } = await BankListService.getBankBIC();

    return response.status(status).send(body);
  }
}

module.exports = BankListController;
