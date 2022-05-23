"use strict";

const Database = use("Database");
const Drive = use("Drive");
const Helpers = use("Helpers");

class ResetSeeder {
  async run() {
    await Database.truncate("api_transactions");
    await Database.truncate("inward");
    await Database.truncate("outward");
    await Database.truncate("pesonet_transactions");
    await Database.truncate("scheduler");
    await Database.truncate("transaction_lists");

    Drive.delete(Helpers.tmpPath("inward_file"));
    Drive.delete(Helpers.tmpPath("inward_message"));
    Drive.delete(Helpers.tmpPath("outward_message"));
    Drive.delete(Helpers.tmpPath("pdf"));
    Drive.delete(Helpers.tmpPath("indexes/index.json"));
    Drive.delete(Helpers.tmpPath("inward_index.json"));
    Drive.delete(Helpers.tmpPath("consolidated_inward"));
    Drive.delete(Helpers.tmpPath("inwardsyncing"));
    Drive.put(
      `${Helpers.tmpPath("indexes")}/index.json`,
      JSON.stringify({ inward: [], outward: [] }, null, 4)
    );
    Drive.put(Helpers.tmpPath("inward_index.json"), "{}");
    Drive.put(Helpers.tmpPath("login_count.json"), "{}");
  }
}

module.exports = ResetSeeder;
