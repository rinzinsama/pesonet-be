"use strict";
const TransactionlistService = use("App/Controllers/Services/Transactionlist");

class TransactionListController {
  async getTransactionList({ response, request }) {
    const { status, body } = await TransactionlistService.getTransactionList(
      request.all()
    );

    return response.status(status).send(body);
  }

  async getTransaction({ response, request }) {
    const { status, body } = await TransactionlistService.getTransaction(
      request.input("referenceId")
    );

    return response.status(status).send(body);
  }

  async getTransactionToday({ response, request }) {
    const { status, body } = await TransactionlistService.getTransactionToday(
      request.input("type")
    );

    return response.status(status).send(body);
  }
}

module.exports = TransactionListController;
