"use strict";

const Task = use("Task");
const SchedulerService = use("Library/Scheduler/Service");

class SyncBankList extends Task {
  static get schedule() {
    return "* * * * *";
  }

  async handle() {
    // await SchedulerService.syncBankList();
  }
}

module.exports = SyncBankList;
