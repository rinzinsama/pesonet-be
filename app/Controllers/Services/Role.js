"use strict";
const BaseService = use("App/Controllers/Services/Base");
const Role = use("App/Models/Role");

class RoleService {
  static async getRoles() {
    const role = await Role.query()
      .where("status", 1)
      .fetch();
    let response = {};

    if (role.rows.length > 0) {
      const parsedData = BaseService.camelCaseBody(role.toJSON());
      response = BaseService.withDataResponseSerializer(parsedData);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }
}

module.exports = RoleService;
