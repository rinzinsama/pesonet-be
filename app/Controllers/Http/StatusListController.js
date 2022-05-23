"use strict";
const StatusListService = use("App/Controllers/Services/StatusList");

class StatusListController {
  async getLists({ request, response }) {
    const { status, body } = await StatusListService.getLists(request.all());

    return response.status(status).send(body);
  }

  async getListsActive({ response }) {
    const { status, body } = await StatusListService.getListsActive();

    return response.status(status).send(body);
  }

  async getList({ request, response }) {
    const { status, body } = await StatusListService.getList(
      request.input("referenceId")
    );

    return response.status(status).send(body);
  }

  async createStatus({ request, response }) {
    const { status, body } = await StatusListService.createStatus(
      request.only(["statusCode", "statusName", "description", "type"])
    );

    return response.status(status).send(body);
  }

  async updateStatus({ request, response }) {
    const { status, body } = await StatusListService.updateStatus(
      request.only([
        "referenceId",
        "statusCode",
        "statusName",
        "description",
        "type",
        "status",
      ])
    );

    return response.status(status).send(body);
  }
}

module.exports = StatusListController;
