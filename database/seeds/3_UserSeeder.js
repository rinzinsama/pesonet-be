"use strict";

const Factory = use("Factory");
const Role = use("App/Models/Role");

class UserSeeder {
  async run() {
    // const roles = await Role.all();

    // let user = roles.toJSON().map((role) => {
    //   return {
    //     role_id: role.id,
    //     username: role.role,
    //   };
    // });

    await Factory.model("App/Models/User").create();
  }
}

module.exports = UserSeeder;
