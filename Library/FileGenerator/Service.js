"use strict";
const moment = use("moment");
const xlsx = use("xlsx");
const Helpers = use("Helpers");
const Drive = use("Drive");

class Service {
  constructor(directory, txn) {
    this.ws;
    this.directory = directory;
    this.txns = {};

    this.createTransactions(txn);
  }

  parseDate(date) {
    return moment(date, "MM/DD/YYYY").format("YYYYMMDD");
  }

  parseTransDate(date) {
    return moment(date, "MM/DD/YYYY").format("YYMMDD");
  }

  createTransactions(txn) {
    const { dates } = txn;
    this.txns.partition1 = dates.map((date, i) => {
      return {
        A: "696",
        B: "1001",
        C: "0122",
      };
    });

    this.txns.partition3 = dates.map((date, i) => {
      return {
        F: "9",
        G: "1",
      };
    });

    this.txns.partition4 = dates.map((date, i) => {
      return {
        I: "22",
      };
    });

    this.txns.partition10 = dates.map((date, i) => {
      return {
        CJ: "1",
        CK: "1",
      };
    });

    this.txns.partition15 = dates.map((date, i) => {
      return {
        DQ: "",
        DR: "",
        DS: "",
        DT: "",
      };
    });
  }

  setData(data) {
    const transactions = { ...this.txns, ...data };
    const { partition1, ...partitions } = transactions;

    let ws = xlsx.utils.json_to_sheet(partition1, {
      skipHeader: true,
      origin: "A1",
    });

    const indexes = [
      "D1",
      "F1",
      "I1",
      "K1",
      "W1",
      "AA1",
      "AC1",
      "CG1",
      "CJ1",
      "CN1",
      "CX1",
      "DM1",
      "DP1",
      "DQ1",
    ];

    Object.keys(partitions).forEach((partition, i) => {
      xlsx.utils.sheet_add_json(ws, partitions[`partition${i + 2}`], {
        skipHeader: true,
        origin: indexes[i],
      });
    });

    this.ws = ws;

    return this;
  }

  generateRaw(data) {
    return { ...this.txns, ...data };
  }

  async generateTSV(filename) {
    const tsv = xlsx.utils.sheet_to_csv(this.ws, { FS: "\t" });
    await Drive.put(`${this.directory}/${filename}`, tsv);
  }
}

module.exports = Service;
