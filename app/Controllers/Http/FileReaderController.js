"use strict";
const FileReaderService = use("App/Controllers/Services/FileReader");

class FileReaderController {
  async checkStatus({ response }) {
    const { status, body } = await FileReaderService.checkStatus();

    return response.status(status).send(body);
  }

  async runReader({ response }) {
    const { status, body } = await FileReaderService.runReader();

    return response.status(status).send(body);
  }

  async updatePath({ request, response }) {
    const { status, body } = await FileReaderService.updatePath(
      request.input("path")
    );

    return response.status(status).send(body);
  }

  async getLogsByDate({ request, response }) {
    const { status, body } = await FileReaderService.getLogsByDate(
      request.input("date")
    );

    return response.status(status).send(body);
  }

  async getLogs({ request, response }) {
    const { status, body } = await FileReaderService.getLogs(request.all());

    return response.status(status).send(body);
  }

  async downloadGeneratedFile({ request, response }) {
    const path = await FileReaderService.downloadGeneratedFile(
      request.input("referenceId")
    );

    return response.download(path);
  }
}

module.exports = FileReaderController;
