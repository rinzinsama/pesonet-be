"use strict";
const BaseService = use("App/Controllers/Services/Base");
const statusType = use("App/Models/StatusType");

class StatusTypeService {
  static async getTypes() {
    const types = await statusType.query().where("status", 1).fetch();
    let response = {};

    if (types.rows.length > 0) {
      const parsedData = BaseService.camelCaseBody(types.toJSON());
      response = BaseService.withDataResponseSerializer(parsedData);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }
}

module.exports = StatusTypeService;
