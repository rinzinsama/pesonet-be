"use strict";

const Task = use("Task");
const SchedulerService = use("Library/Scheduler/Service");

class CheckOutward extends Task {
  static get schedule() {
    return "* * * * *";
  }

  async handle() {
    await SchedulerService.checkOutward();
  }
}

module.exports = CheckOutward;
