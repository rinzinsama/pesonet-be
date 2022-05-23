"use strict";
const Serializer = use("Library/Validator/Serializer");

class AuditTrailGetAuditTrail {
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
      from: "required|string|isDate",
      to: "required|string|isDate|isGreaterDate:from",
    };
  }

  get messages() {
    return {
      "search.string": "(search) must be string.",
      "limit.integer": "(limit) must be integer.",
      "page.integer": "(page) must be integer.",
      "page.isPaginate": "(page) limit must be passed to enable pagination.",
      "from.required": "(from) is required.",
      "from.string": "(from) must be string.",
      "from.isDate": "(from) format is incorrect.",
      "to.required": "(from) is required.",
      "to.string": "(to) must be string.",
      "to.isDate": "(to) format is incorrect.",
      "to.isGreaterDate": "(to) must be equal or greater than from.",
    };
  }

  get sanitizationRules() {
    return {
      search: "trim",
      limit: "trim|to_int",
      page: "trim|to_int",
      from: "trim",
      to: "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = AuditTrailGetAuditTrail;
