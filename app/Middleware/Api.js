"use strict";
const Logger = use("Logger");
const moment = use("moment");
const AuditTrail = use("App/Models/AuditTrail");
const { sentenceCase } = use("sentence-case");

class Api {
  async handle({ request, response, auth }, next) {
    const startTime = moment().format("MMMM D, YYYY - h:mm:ss A");
    await next();

    const auditTrail = new AuditTrail();
    const url = request.originalUrl();
    const [module, method] = url.split("/").slice(-2);
    const username = auth.user ? auth.user.username : "";

    auditTrail.merge({
      username,
      ip: request.ip(),
      url,
      module: sentenceCase(module).toUpperCase(),
      method: sentenceCase(method).toUpperCase(),
      log:
        response.lazyBody.content && response.lazyBody.content.message
          ? response.lazyBody.content.message
          : "",
    });

    await auditTrail.save();

    Logger.transport("api").info({
      startTimestamp: startTime,
      endTimestamp: moment().format("MMMM D, YYYY - h:mm:ss A"),
      referenceId: auditTrail.reference_id,
      request: request.all(),
      response: response.lazyBody.content,
    });
  }
}

module.exports = Api;
