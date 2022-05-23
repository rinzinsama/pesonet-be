"use strict";

const Factory = use("Factory");

class RoleSeeder {
  async run() {
    let role = ["Administrator", "Maker", "Checker"];

    for (let index = 0; index < role.length; index++) {
      await Factory.model("App/Models/Role").create(role[index]);
    }
  }
}

module.exports = RoleSeeder;
