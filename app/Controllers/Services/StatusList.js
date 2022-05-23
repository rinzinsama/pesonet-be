"use strict";
const BaseService = use("App/Controllers/Services/Base");
const StatusList = use("App/Models/StatusList");

class StatusListService {
  static fields() {
    return ["reference_id", "status_code", "status_name"];
  }

  static async getLists(request) {
    const { search, page, limit, filter } = request;
    let response = {};
    let query = StatusList.query().with("statusType");

    if (filter && filter == -1) query.where("status", 0);
    else if (filter && filter != 0) query.where("type", filter);

    if (search && search.length > 0)
      query = BaseService.searchQuery(
        query,
        StatusListService.fields(),
        search
      );

    if (limit && !page) query.limit(limit);
    
    query.orderBy("id", "asc");

    const { data, ...obj } = await BaseService.getData(query, page, limit);

    if (data.length == 0) response = BaseService.noDataResponseSerializer();
    else {
      data.map((list, key) => {
        data[key].type = list.statusType.type;
      });

      const parsedData = BaseService.camelCaseBody(data);
      response = BaseService.withDataResponseSerializer(parsedData, obj);
    }

    return response;
  }

  static async getListsActive() {
    const lists = await StatusList.query().where("status", 1).fetch();

    let response = {};

    if (lists.rows.length > 0) {
      const parsedData = BaseService.camelCaseBody(lists.toJSON());
      response = BaseService.withDataResponseSerializer(parsedData);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async getList(refId) {
    let response = {};
    let status = await StatusList.findBy("reference_id", refId);
    await status.load("statusType");

    if (status) {
      const statusData = status.toJSON();
      const parsedData = BaseService.camelCaseBody(statusData);
      response = BaseService.withDataResponseSerializer(parsedData);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async createStatus(request) {
    const parsedRequest = BaseService.parseToSnakeCase(request);

    const list = new StatusList();
    list.merge(parsedRequest);

    await list.save();
    const parsedData = BaseService.camelCaseBody(list.toJSON());

    const response = BaseService.withDataResponseSerializer(
      parsedData,
      null,
      "Successfully created data."
    );

    return response;
  }

  static async updateStatus(request) {
    const { referenceId, ...data } = request;
    const parsedRequest = BaseService.parseToSnakeCase(data);
    const status = await StatusList.findBy("reference_id", referenceId);

    status.merge(parsedRequest);
    await status.save();

    const parsedData = BaseService.camelCaseBody(status.toJSON());

    const response = BaseService.withDataResponseSerializer(
      parsedData,
      null,
      "Successfully updated data."
    );

    return response;
  }
}

module.exports = StatusListService;
