"use strict";
const ModuleService = use("App/Controllers/Services/Module");

class ModuleController {
  async getModules({ request, response }) {
    const { status, body } = await ModuleService.getModules(
      request.input("status")
    );

    return response.status(status).send(body);
  }

  async getRoleModules({ request, response }) {
    const { status, body } = await ModuleService.getRoleModules(
      request.input("id")
    );

    return response.status(status).send(body);
  }

  async updateModule({ request, response }) {
    const { status, body } = await ModuleService.updateModule(request.all());

    return response.status(status).send(body);
  }
}

module.exports = ModuleController;
