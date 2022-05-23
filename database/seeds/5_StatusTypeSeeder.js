"use strict";

const Factory = use("Factory");

class StatusTypeSeeder {
  async run() {
    let statusLists = [
      {
        type: "Success",
      },
      {
        type: "Failed",
      },
      {
        type: "Hold",
      },
    ];

    await Factory.model("App/Models/StatusType").createMany(
      statusLists.length,
      statusLists
    );
  }
}

module.exports = StatusTypeSeeder;
