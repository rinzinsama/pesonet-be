"use strict";
const TransactionLogService = use("App/Controllers/Services/TransactionLog");

class TransactionLogController {
  async getLogs({ request, response }) {
    const { status, body } = await TransactionLogService.getLogs(
      request.only(["referenceId", "type"])
    );

    return response.status(status).send(body);
  }
}

module.exports = TransactionLogController;
