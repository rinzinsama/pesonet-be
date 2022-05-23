"use strict";
const ReportService = use("App/Controllers/Services/Report");

class ReportController {
  async generateOutwardTransactionReport({ request, response }) {
    const {
      status,
      body,
    } = await ReportService.generateOutwardTransactionReport(
      request.input("date")
    );

    return response.status(status).send(body);
  }

  async generateInwardTransactionReport({ request, response }) {
    const {
      status,
      body,
    } = await ReportService.generateInwardTransactionReport(
      request.input("date")
    );

    return response.status(status).send(body);
  }

  async generateTransactionXLSX({ request, response }) {
    const buff = await ReportService.generateTransactionXLSX(request.all());

    return response.status(200).send(buff);
  }

  async generateTransactionPDF({ request, response }) {
    const { status, body } = await ReportService.generateTransactionPDF(
      request.all()
    );

    return response.status(status).send(body);
  }

  async generateTransactionPDFTable({ request, response }) {
    const { status, body } = await ReportService.generateTransactionPDFTable(
      request.all()
    );

    return response.status(status).send(body);
  }

  async generatePesonetReport({ request, response }) {
    const { status, body } = await ReportService.generatePesonetReport(
      request.input("date")
    );

    return response.status(status).send(body);
  }

  async generatePesonetReportPDF({ request, response }) {
    const { status, body } = await ReportService.generatePesonetReportPDF(
      request.all()
    );

    return response.status(status).send(body);
  }
}

module.exports = ReportController;
