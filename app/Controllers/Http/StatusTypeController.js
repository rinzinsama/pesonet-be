"use strict";
const StatusTypeService = use("App/Controllers/Services/StatusType");

class StatusTypeController {
  async getTypes({ request, response }) {
    const { status, body } = await StatusTypeService.getTypes();

    return response.status(status).send(body);
  }
}

module.exports = StatusTypeController;
