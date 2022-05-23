"use strict";
const OutwardService = use("App/Controllers/Services/Outward");

class OutwardController {
  async getOutwardBatch({ response, request }) {
    const { status, body } = await OutwardService.getOutwardBatch(
      request.all()
    );

    return response.status(status).send(body);
  }

  async createOutwardMessage({ response, request, auth }) {
    const { status, body } = await OutwardService.createOutwardMessage(
      request.only(["bicOfBank", "transactions"]),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async getTransactionsRaw({ response, request }) {
    const { status, body } = await OutwardService.getTransactionsRaw(
      request.input("referenceId")
    );

    return response.status(status).send(body);
  }

  async getTransactions({ response, request, auth }) {
    const { status, body } = await OutwardService.getTransactions(
      request.input("referenceId"),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async reject({ response, request, auth }) {
    const { status, body } = await OutwardService.reject(
      request.all(),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async saveOutwardMessage({ response, request, auth }) {
    const { status, body } = await OutwardService.saveOutwardMessage(
      request.all(),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async sendOutwardMessage({ response, request, auth }) {
    const { status, body } = await OutwardService.sendOutwardMessage(
      request.all(),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async uploadOutward({ response, request, auth }) {
    const { status, body } = await OutwardService.uploadOutward(
      request.file("outward_message"),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async generatePDF({ response, request, auth }) {
    const { status, body } = await OutwardService.generatePDF(
      request.input("referenceId"),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async validateOutwardMessage({ response, request, auth }) {
    const { status, body } = await OutwardService.validateOutwardMessage(
      request.input("referenceId"),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async checkOutwardProcessing({ response, request }) {
    const { status, body } = await OutwardService.checkOutwardProcessing(
      request.input("referenceId")
    );

    return response.status(status).send(body);
  }

  async enableOutwardProcessing({ response, request }) {
    const { status, body } = await OutwardService.enableOutwardProcessing(
      request.input("referenceId")
    );

    return response.status(status).send(body);
  }
}

module.exports = OutwardController;
