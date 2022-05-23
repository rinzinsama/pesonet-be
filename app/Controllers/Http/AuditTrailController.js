"use strict";

const AuditTrailService = use("App/Controllers/Services/AuditTrail");

class AuditTrailController {
  async getAuditTrail({ request, response }) {
    const { status, body } = await AuditTrailService.getAuditTrail(
      request.all()
    );

    return response.status(status).send(body);
  }
}

module.exports = AuditTrailController;
