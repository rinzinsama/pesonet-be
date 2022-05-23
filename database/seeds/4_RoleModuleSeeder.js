"use strict";

const Factory = use("Factory");

class RoleModuleSeeder {
  async run() {
    let roleModules = [
      {
        role_id: 1,
        module: 0,
      },
      {
        role_id: 1,
        module: 100,
      },
      {
        role_id: 1,
        module: 110,
      },
      {
        role_id: 1,
        module: 120,
      },
      {
        role_id: 1,
        module: 130,
      },
      {
        role_id: 1,
        module: 200,
      },
      {
        role_id: 1,
        module: 300,
      },
      // {
      //   role_id: 1,
      //   module: 400,
      // },
      {
        role_id: 1,
        module: 500,
      },
      {
        role_id: 1,
        module: 600,
      },
      {
        role_id: 1,
        module: 700,
      },
      {
        role_id: 2,
        module: 0,
      },
      {
        role_id: 2,
        module: 200,
      },
      {
        role_id: 2,
        module: 800,
      },
      {
        role_id: 2,
        module: 900,
      },
      {
        role_id: 2,
        module: 1000,
      },
      {
        role_id: 3,
        module: 0,
      },
      {
        role_id: 3,
        module: 200,
      },
      {
        role_id: 3,
        module: 800,
      },
      {
        role_id: 3,
        module: 900,
      },
      {
        role_id: 3,
        module: 1000,
      },
      {
        role_id: 1,
        module: 1100,
      },
      {
        role_id: 1,
        module: 1110,
      },
      {
        role_id: 1,
        module: 1120,
      },
      {
        role_id: 1,
        module: 1200,
      },
      {
        role_id: 2,
        module: 1300,
      },
      {
        role_id: 3,
        module: 1300,
      },
      {
        role_id: 2,
        module: 1400,
      },
      {
        role_id: 3,
        module: 1400,
      },
    ];

    await Factory.model("App/Models/RoleModule").createMany(
      roleModules.length,
      roleModules
    );
  }
}

module.exports = RoleModuleSeeder;
