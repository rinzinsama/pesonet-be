"use strict";
const RoleService = use("App/Controllers/Services/Role");

class RoleController {
  async getRoles({ request, response }) {
    const { status, body } = await RoleService.getRoles();

    return response.status(status).send(body);
  }
}

module.exports = RoleController;
