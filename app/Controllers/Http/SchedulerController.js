"use strict";

const SchedulerService = use("App/Controllers/Services/Scheduler");

class SchedulerController {
  async getSchedulerLogs({ request, response }) {
    const { status, body } = await SchedulerService.getSchedulerLogs(
      request.all()
    );

    return response.status(status).send(body);
  }

  async getlastSync({ request, response }) {
    const { status, body } = await SchedulerService.getlastSync(
      request.input("type")
    );

    return response.status(status).send(body);
  }

  async syncIndex({ request, response, auth }) {
    const { status, body } = await SchedulerService.syncIndex(
      request.all(),
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async syncBankList({ request, response, auth }) {
    const { status, body } = await SchedulerService.syncBankList(
      auth.user.username
    );

    return response.status(status).send(body);
  }

  async isSyncing({ request, response }) {
    const { status, body } = await SchedulerService.isSyncing(
      request.input("type")
    );

    return response.status(status).send(body);
  }
}

module.exports = SchedulerController;
