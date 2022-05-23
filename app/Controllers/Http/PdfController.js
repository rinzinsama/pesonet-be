"use strict";
const PdfService = use("App/Controllers/Services/Pdf");

class PdfController {
  async viewPDF({ params, response }) {
    const pdf = await PdfService.viewPDF(params);

    response.type("application/pdf");
    return response.send(pdf);
  }
}

module.exports = PdfController;
