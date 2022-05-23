"use strict";

const Task = use("Task");
const SchedulerService = use("Library/Scheduler/Service");

class SyncOutward extends Task {
  static get schedule() {
    return "* * * * *";
  }

  async handle() {
    // await SchedulerService.syncOutward();
  }
}

module.exports = SyncOutward;
