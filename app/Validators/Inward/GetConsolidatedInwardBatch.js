"use strict";
const Serializer = use("Library/Validator/Serializer");

class InwardGetConsolidatedInwardBatch {
  async authorize() {
    const user = this.ctx.auth.user;

    if (![2, 3].includes(+user.role_id))
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
      date: "string|isDate",
    };
  }

  get messages() {
    return {
      "search.string": "(search) must be string.",
      "limit.integer": "(limit) must be integer.",
      "page.integer": "(page) must be integer.",
      "page.isPaginate": "(page) limit must be passed to enable pagination.",
      "date.string": "(date) must be string.",
      "date.isDate": "(date) format is incorrect..",
    };
  }

  get sanitizationRules() {
    return {
      search: "trim",
      limit: "trim|to_int",
      page: "trim|to_int",
      date: "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = InwardGetConsolidatedInwardBatch;
