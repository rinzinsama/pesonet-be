"use strict";

const Factory = use("Factory");

class ModuleSeeder {
  async run() {
    let modules = [
      {
        module: 0,
        description: "Dashboard",
      },
      {
        module: 100,
        description: "User Management",
      },
      {
        module: 110,
        description: "Create User",
      },
      {
        module: 120,
        description: "Update User",
      },
      {
        module: 130,
        description: "Change Password",
      },
      {
        module: 200,
        description: "Profile",
      },
      {
        module: 300,
        description: "Module",
      },
      // {
      //   module: 400,
      //   description: "File Reader",
      // },
      {
        module: 500,
        description: "Audit Trail",
      },
      {
        module: 600,
        description: "API",
      },
      {
        module: 700,
        description: "Scheduler",
      },
      {
        module: 800,
        description: "Bank List",
      },
      {
        module: 900,
        description: "Inward",
      },
      {
        module: 1000,
        description: "Outward",
      },
      {
        module: 1100,
        description: "Status List Management",
      },
      {
        module: 1110,
        description: "Create Status",
      },
      {
        module: 1120,
        description: "Update Status",
      },
      {
        module: 1200,
        description: "Bank Configuration",
      },
      {
        module: 1300,
        description: "Transaction List",
      },
      {
        module: 1400,
        description: "Report",
      },
    ];

    await Factory.model("App/Models/Module").createMany(
      modules.length,
      modules
    );
  }
}

module.exports = ModuleSeeder;
