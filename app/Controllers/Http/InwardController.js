"use strict";
const InwardService = use("App/Controllers/Services/Inward");

class InwardController {
  async getInwardBatch({ response, request }) {
    const { status, body } = await InwardService.getInwardBatch(request.all());

    return response.status(status).send(body);
  }

  async getConsolidatedInwardBatch({ response, request }) {
    const { status, body } = await InwardService.getConsolidatedInwardBatch(
      request.all()
    );

    return response.status(status).send(body);
  }

  async getConsolidatedTotals({ response, request }) {
    const { status, body } = await InwardService.getConsolidatedTotals(
      request.input("settlementDate")
    );

    return response.status(status).send(body);
  }

  async getTransactions({ response, request, auth }) {
    const { status, body } = await InwardService.getTransactions(
      request.input("referenceId"),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async downloadFile({ request, response }) {
    const path = await InwardService.downloadFile(request.all());

    return response.download(path);
  }

  async updateStatus({ request, response, auth }) {
    const { status, body } = await InwardService.updateStatus(
      request.all(),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async reject({ request, response, auth }) {
    const { status, body } = await InwardService.reject(
      request.all(),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async sendStatus({ request, response, auth }) {
    const { status, body } = await InwardService.sendStatus(
      request.all(),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async generatePDF({ response, request }) {
    const { status, body } = await InwardService.generatePDF(
      request.input("referenceId")
    );

    return response.status(status).send(body);
  }

  async generateFilePDF({ response, request }) {
    const { status, body } = await InwardService.generateFilePDF(
      request.input("file")
    );

    return response.status(status).send(body);
  }

  async getTransactionForFileGeneration({ response, request }) {
    const {
      status,
      body,
    } = await InwardService.getTransactionForFileGeneration(
      request.input("date")
    );

    return response.status(status).send(body);
  }

  async downloadGroupFile({ response, request, auth }) {
    const file = await InwardService.downloadGroupFile(
      request.all(),
      auth.user.username
    );

    return response.status(200).send(file);
  }

  async getConsolidatedTransactions({ response, request }) {
    const { status, body } = await InwardService.getConsolidatedTransactions(
      request.input("settlementDate")
    );

    return response.status(status).send(body);
  }

  async saveConsolidatedInward({ request, response, auth }) {
    const { status, body } = await InwardService.saveConsolidatedInward(
      request.all(),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async regenerateFiles({ request, response, auth }) {
    const { status, body } = await InwardService.regenerateFiles(
      request.input("settlementDate"),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async getInwardConsolidatedLogs({ request, response }) {
    const { status, body } = await InwardService.getInwardConsolidatedLogs(
      request.input("settlementDate")
    );

    return response.status(status).send(body);
  }

  async checkForResync({ request, response }) {
    const { status, body } = await InwardService.checkForResync(
      request.input("settlementDate")
    );

    return response.status(status).send(body);
  }

  async reSyncInward({ request, response, auth }) {
    const { status, body } = await InwardService.reSyncInward(
      request.input("settlementDate"),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async generatePDFTable({ request, response, auth }) {
    const { status, body } = await InwardService.generatePDFTable(
      request.all(),
      auth.user.username
    );

    return response.status(status).send(body);
  }
}

module.exports = InwardController;
