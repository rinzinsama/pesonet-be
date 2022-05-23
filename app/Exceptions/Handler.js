"use strict";
const Logger = use("Logger");
const moment = use("moment");
const BaseExceptionHandler = use("BaseExceptionHandler");

class ExceptionHandler extends BaseExceptionHandler {
  async handle(error, { request, response }) {
    response.status(500).json({
      message: "Internal server error."
    });
  }

  async report(error, { request }) {
    Logger.transport("error").error({
      timestamp: moment().format("MMMM D, YYYY - h:mm:ss A"),
      error: error.stack.replace(/\n\s+/gm, " "),
      request: request.all()
    });
  }
}

module.exports = ExceptionHandler;
