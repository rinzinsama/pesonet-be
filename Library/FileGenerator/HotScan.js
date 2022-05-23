"use strict";
const Generator = use("Library/FileGenerator/Service");

class HotScan extends Generator {
  constructor(txn, filename, directory, start) {
    super(directory, txn);
    this.transactions = {};
    this.filename = filename;
    this.start = start;

    this.mapTransactions(txn);
  }

  mapTransactions(txn) {
    const {
      dates,
      senderName,
      currency,
      amount,
      accountNumbers,
      notes,
      maker,
      checker,
      reference,
      fullAccountNumbers
    } = txn;

    this.transactions.partition2 = dates.map((date, i) => {
      return {
        D: `IN${this.parseTransDate(date)}3696X00${(
          "" +
          (this.start + i + 1)
        ).padStart(3, "0")}`,
      };
    });

    this.transactions.partition5 = dates.map((date, i) => {
      return {
        K: this.parseDate(date),
      };
    });

    this.transactions.partition6 = dates.map((date, i) => {
      return {
        W: senderName[i],
        X: currency[i],
        Y: amount[i],
      };
    });

    this.transactions.partition7 = dates.map((date, i) => {
      return {
        AA: currency[i],
      };
    });

    this.transactions.partition8 = dates.map((date, i) => {
      return {
        AC: accountNumbers[i],
      };
    });

    this.transactions.partition9 = dates.map((date, i) => {
      return {
        CG: notes[i],
      };
    });

    this.transactions.partition11 = dates.map((date, i) => {
      return {
        CN: maker[i],
        CO: checker[i],
      };
    });

    this.transactions.partition12 = dates.map((date, i) => {
      return {
        CX: senderName[i].substring(0, 140),
        CY: fullAccountNumbers[i].substring(0, 35),
      };
    });

    this.transactions.partition13 = dates.map((date, i) => {
      return {
        DM: reference[i],
      };
    });

    this.transactions.partition14 = dates.map((date, i) => {
      return {
        DP: senderName[i],
      };
    });
  }

  generateRaw() {
    return super.generateRaw(this.transactions);
  }

  async generate() {
    const filename = this.filename;

    await this.setData(this.transactions).generateTSV(filename);
  }
}

module.exports = HotScan;
