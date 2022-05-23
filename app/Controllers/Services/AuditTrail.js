"use strict";

const BaseService = use("App/Controllers/Services/Base");
const AuditTrail = use("App/Models/AuditTrail");

class AuditTrailService {
  static fields() {
    return ["reference_id", "username", "ip", "module", "method", "log"];
  }

  static async getAuditTrail(request) {
    const { search, page, limit, from, to } = request;
    let response = {};

    let query = AuditTrail.query();

    query.where("module", "!=", "AUDIT");
    query.whereRaw("CAST(created_at as date) >= ?", from);
    query.whereRaw("CAST(created_at as date) <= ?", to);

    if (search && search.length > 0)
      query = BaseService.searchQuery(
        query,
        AuditTrailService.fields(),
        search
      );

    if (limit && !page) query.limit(limit);
    
    query.orderBy("id", "asc");
    
    const { data, ...obj } = await BaseService.getData(query, page, limit);
  
    if (data.length == 0) response = BaseService.noDataResponseSerializer();
    else {
      const parsedData = BaseService.camelCaseBody(data);
      response = BaseService.withDataResponseSerializer(parsedData, obj);
    }

    return response;
  }
}

module.exports = AuditTrailService;
