"use strict";
const Serializer = use("Library/Validator/Serializer");

class SchedulerGetSchedulerLogs {
  async authorize() {
    const user = this.ctx.auth.user;

    if (user.role_id != 1)
      return this.ctx.response.status(403).json({
        message: "You are not allowed access this method.",
      });

    return true;
  }

  get validateAll() {
    return true;
  }

  get rules() {
    return {
      search: "string",
      limit: "integer",
      page: "integer|isPaginate",
      filter: "string|inStringArray:0,1,-1,SYNC BANK LIST,SYNC INWARD,SYNC OUTWARD,OUTWARD MESSAGE",
    };
  }

  get messages() {
    return {
      "search.string": "(search) must be string.",
      "limit.integer": "(limit) must be integer.",
      "page.integer": "(page) must be integer.",
      "page.isPaginate": "(page) limit must be passed to enable pagination.",
      "filter.string": "(filter) must be string.",
      "filter.inStringArray": "(filter) value is invalid.",
    };
  }

  get sanitizationRules() {
    return {
      search: "trim",
      limit: "trim|to_int",
      page: "trim|to_int",
      filter: "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = SchedulerGetSchedulerLogs;
