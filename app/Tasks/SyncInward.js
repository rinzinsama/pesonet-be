"use strict";

const Task = use("Task");
const SchedulerService = use("Library/Scheduler/Service");

class SyncInward extends Task {
  static get schedule() {
    return "* * * * *";
  }

  async handle() {
    // await SchedulerService.syncInward();
  }
}

module.exports = SyncInward;
