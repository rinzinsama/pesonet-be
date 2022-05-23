"use strict";

const BaseService = use("App/Controllers/Services/Base");
const Scheduler = use("App/Models/Scheduler");
const SchedulerLibService = use("Library/Scheduler/Service");
const Drive = use("Drive");

class SchedulerService {
  static fields() {
    return ["reference_id", "description"];
  }

  static async getSchedulerLogs(request) {
    const { search, page, limit, filter } = request;
    let response = {};
    let query = Scheduler.query().orderBy("id", "desc");

    if (filter && filter == "-1") query.where("status", 0);
    else if (filter && filter == "1") query.where("status", 1);
    else if (filter && filter != "0") query.where("type", filter);

    if (search && search.length > 0)
      query = BaseService.searchQuery(query, SchedulerService.fields(), search);

    if (limit && !page) query.limit(limit);

    const { data, ...obj } = await BaseService.getData(query, page, limit);

    if (data.length == 0) response = BaseService.noDataResponseSerializer();
    else {
      const parsedData = BaseService.camelCaseBody(data);
      response = BaseService.withDataResponseSerializer(parsedData, obj);
    }

    return response;
  }

  static async getlastSync(type) {
    let response = {};

    const schedule = await Scheduler.query()
      .where("type", type)
      .orderBy("id", "desc")
      .first();

    if (!schedule) response = BaseService.noDataResponseSerializer();
    else {
      const { created_at, type } = schedule.toJSON();
      response = BaseService.withDataResponseSerializer({
        lastSync: created_at,
        type,
      });
    }

    return response;
  }

  static async syncIndex(request, user) {
    const { type, settlementDate, cycle } = request;

    if (type == "OUTWARD")
      await SchedulerLibService.syncOutward(settlementDate, cycle, false, user);
    else
      await SchedulerLibService.syncInward(settlementDate, cycle, false, user);

    return BaseService.noDataResponseSerializer(
      "Synchronization successful.",
      200
    );
  }

  static async syncBankList(user) {
    await SchedulerLibService.syncBankList(false, user);

    return BaseService.noDataResponseSerializer(
      "Synchronization successful.",
      200
    );
  }

  static async isSyncing(type) {
    let path = "";

    if (type == "inward") path = "inwardsyncing";

    const isSyncing = await Drive.exists(path);

    return BaseService.withDataResponseSerializer({ isSyncing });
  }
}

module.exports = SchedulerService;
