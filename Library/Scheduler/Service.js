"use strict";
const APIService = use("App/Controllers/Services/Api");
const SchedulerModel = use("App/Models/Scheduler");
const Drive = use("Drive");
const Helpers = use("Helpers");
const { green, red, cyan } = use("kleur");
const moment = use("moment");
use("moment-business-days");
const Outward = use("App/Models/Outward");
const OutwardParser = use("Library/Outward/Service");
const PesonetTransaction = use("App/Models/PesonetTransaction");
const Inward = use("App/Models/Inward");
const Socket = use("Socket");
const InwardService = use("Library/Inward/Service");

class Service {
  static async checkOutward() {
    const outward = await Outward.query()
      .whereIn("status", [2, 3])
      .setVisible(["id", "sequence_number"])
      .fetch();

    if (outward.rows.length > 0) {
      const outwardData = outward.toJSON();
      for (let index = 0; index < outwardData.length; index++) {
        let transactionsFromApi = await Promise.all(
          outwardData[index].sequence_number.split(", ").map(async (seq) => {
            const { body } = await APIService.sendOutwardMessageStatusUpdate(
              seq
            );

            if (body.responseStatus != 200) return;

            const parser = new OutwardParser(body.data.TxInfAndSts);
            const transactions = parser.populateTransactionFromApi();
            return transactions;
          })
        );

        const transactions = {
          transactions: [].concat.apply(
            [],
            transactionsFromApi.filter(Boolean)
          ),
        };

        if (transactions.transactions.length > 0) {
          const OutwardService = new OutwardParser(transactions);
          await OutwardService.hasStatus(outwardData[index].id);
        }
      }
    }

    console.log(
      `${cyan("Outward Checker:")} checked ${outward.rows.length} batch/es`
    );
  }

  static async archiveData() {
    const outward = await Outward.query().where("status", 1).fetch();

    outward.toJSON().forEach((data) => {
      console.log(
        moment(data.settlement_date, "MMMM D, YYYY")
          .businessAdd(1)
          .format("YYYY-MM-DD 2PM")
      );
    });
  }

  static async syncInward(
    date = moment().format("YYYY-MM-DD"),
    cycle = 1,
    log = true,
    user = "SYSTEM"
  ) {
    await InwardService.createInwardLog(date, "sync", user);

    await Drive.put("inwardsyncing", "");
    Socket.broadcastData("Scheduler", "triggerSync", {
      type: "inward",
      message: "Sync triggered.",
    });

    const { status, body } = await APIService.sendIndex(
      {
        cycle,
        settlementDate: moment(date, "YYYY-MM-DD").format("YYYY-MM-DD"),
      },
      user
    );

    if (status == 200) {
      const { cycle, inward_batches } = body.data.index;
      const settlement_date = body.data.index.settlement_date;

      if (inward_batches.length > 0) {
        const indexes = await Drive.get(Helpers.tmpPath(`indexes/index.json`));
        const indexesData = JSON.parse(indexes.toString());
        const batches = inward_batches.filter(
          (seq) => !indexesData.inward.includes(seq)
        );

        if (batches.length > 0) {
          const inwardData = batches.map((seqNo) => {
            return {
              sequence_number: seqNo,
              cycle,
              settlement_date,
            };
          });

          const createdData = await Inward.createMany(inwardData);

          const transData = createdData.map((data) => {
            return {
              transaction_id: data.id,
              user: "SYSTEM",
              type: "INWARD",
              remarks: "Synced and created inward message.",
            };
          });

          indexesData.inward = [...indexesData.inward, ...batches];

          await PesonetTransaction.createMany(transData);
          await Drive.put(
            `${Helpers.tmpPath("indexes")}/index.json`,
            JSON.stringify(indexesData, null, 4)
          );

          try {
            for (let idx = 0; idx < createdData.length; idx++) {
              await InwardService.generateTransaction(
                createdData[idx].sequence_number,
                createdData[idx].settlement_date,
                "SYSTEM"
              );
            }
          } catch {}
        }
      }
    }

    const schedulerModel = new SchedulerModel();
    schedulerModel.merge({
      description: "SYNC INWARD",
      type: "SYNC INWARD",
      status: status == 200 ? 1 : 0,
    });

    await schedulerModel.save();

    await Drive.delete("inwardsyncing");
    Socket.broadcastData("Scheduler", "triggerSync", {
      type: "inward",
      message: "Sync triggered.",
    });

    if (log)
      console.log(
        `${
          status != 200 ? red("Failed") : green("Success")
        }: Sync inward scheduler.`
      );
  }

  static async syncOutward(
    date = moment().format("YYYY-MM-DD"),
    cycle = 1,
    log = true,
    user = "SYSTEM"
  ) {
    const { status, body } = await APIService.sendIndex(
      {
        cycle,
        settlementDate: moment(date, "YYYY-MM-DD").format("YYYY-MM-DD"),
      },
      user
    );

    if (status == 200) {
      const { outward_batches } = body.data.index;
      const settlement_date = moment(
        body.data.index.settlement_date,
        "YYYY-MM-DD"
      ).format("MMMM D, YYYY");

      if (outward_batches.length > 0) {
        const indexes = await Drive.get(Helpers.tmpPath(`indexes/index.json`));
        const indexesData = JSON.parse(indexes.toString());
        const batches = outward_batches.filter(
          (seq) => !indexesData.outward.includes(seq)
        );

        if (batches.length > 0) {
          const outwardData = batches.map((seqNo) => {
            return {
              sequence_number: seqNo,
              settlement_date,
              status: 2,
            };
          });

          const createdData = await Outward.createMany(outwardData);
          const transData = createdData.map((data) => {
            return {
              transaction_id: data.id,
              user: "SYSTEM",
              type: "OUTWARD",
              remarks: "Synced and created outward message.",
            };
          });

          indexesData.outward = [...indexesData.outward, ...batches];

          await PesonetTransaction.createMany(transData);
          await Drive.put(
            `${Helpers.tmpPath("indexes")}/index.json`,
            JSON.stringify(indexesData, null, 4)
          );
        }
      }
    }

    const schedulerModel = new SchedulerModel();
    schedulerModel.merge({
      description: "SYNC OUTWARD",
      type: "SYNC OUTWARD",
      status: status == 200 ? 1 : 0,
    });

    await schedulerModel.save();

    if (log)
      console.log(
        `${
          status != 200 ? red("Failed") : green("Success")
        }: Sync outward scheduler.`
      );
  }

  static async syncBankList(log = true, user = "SYSTEM") {
    const { body } = await APIService.sendBankList(user);

    if (body.responseStatus == 200)
      await Drive.put(
        `${Helpers.tmpPath("bank_list")}/list.json`,
        JSON.stringify(body.data, null, 4)
      );

    const schedulerModel = new SchedulerModel();
    schedulerModel.merge({
      description: "SYNC BANK LIST",
      type: "SYNC BANK LIST",
      status: body.responseStatus == 200 ? 1 : 0,
    });

    await schedulerModel.save();

    Socket.broadcastData("BankList", "save", {
      message: "New Entry",
    });

    if (log)
      console.log(
        `${
          body.responseStatus != 200 ? red("Failed") : green("Success")
        }: Bank list scheduler.`
      );
  }
}

module.exports = Service;
