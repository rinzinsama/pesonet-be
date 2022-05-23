"use strict";
const ApiService = use("App/Controllers/Services/Api");

class ApiController {
  async getApiSettings({ response }) {
    const { status, body } = await ApiService.getApiSettings();

    return response.status(status).send(body);
  }

  async uploadCreds({ request, response }) {
    const { status, body } = await ApiService.uploadCreds(
      request.file("certificate")
    );

    return response.status(status).send(body);
  }

  async updateAPISettings({ request, response }) {
    const { status, body } = await ApiService.updateAPISettings(request.all());

    return response.status(status).send(body);
  }

  async sendHeartbeat({ response, auth }) {
    const { status, body } = await ApiService.sendHeartbeat(auth.user.username);

    return response.status(status).send(body);
  }

  async sendBankList({ response, auth }) {
    const { status, body } = await ApiService.sendBankList(auth.user.username);

    return response.status(status).send(body);
  }

  async sendIndex({ request, response, auth }) {
    const { status, body } = await ApiService.sendIndex(
      request.all(),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async sendInwardBatch({ request, response, auth }) {
    const { status, body } = await ApiService.sendInwardBatch(
      request.input("sequenceNumber"),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async sendOutwardMessage({ request, response, auth }) {
    const { status, body } = await ApiService.sendOutwardMessage(
      request.all(),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async sendOutwardMessageStatusUpdate({ request, response, auth }) {
    const { status, body } = await ApiService.sendOutwardMessageStatusUpdate(
      request.input("sequenceNumber"),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async sendOutwardMessageSearch({ request, response, auth }) {
    const { status, body } = await ApiService.sendOutwardMessageSearch(
      request.input("localExternalCode"),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async sendInwardBatchStatusUpdate({ request, response, auth }) {
    const { status, body } = await ApiService.sendInwardBatchStatusUpdate(
      request.all(),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async getLogs({ request, response }) {
    const { status, body } = await ApiService.getLogs(request.all());

    return response.status(status).send(body);
  }
}

module.exports = ApiController;
