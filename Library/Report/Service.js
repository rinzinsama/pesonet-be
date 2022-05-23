const Helpers = use("Helpers");
const Drive = use("Drive");
const Outward = use("App/Models/Outward");
const TransactionListLibService = use("Library/TransactionList/Service");
const moment = use("moment");

class Service {
  static setTransactionRack(transactions, type) {
    let transRack = {};

    transactions.forEach((txn) => {
      if (txn.type == type)
        transRack[txn.sequence_number] = transRack[txn.sequence_number]
          ? [
              ...transRack[txn.sequence_number],
              {
                ofiReferenceNumber: txn.ofi_reference_number,
                settlementDate: txn.settlement_date,
              },
            ]
          : [
              {
                ofiReferenceNumber: txn.ofi_reference_number,
                settlementDate: txn.settlement_date,
              },
            ];
    });

    return transRack;
  }

  static async generateOutwardTransactions(transRack) {
    const txns = [];
    const keyRack = Object.keys(transRack);

    for (let rackIdx = 0; rackIdx < keyRack.length; rackIdx++) {
      const innerRack = transRack[keyRack[rackIdx]];

      const outwardModel = await Outward.query()
        .where("sequence_number", "LIKE", `%${keyRack[rackIdx]}%`)
        .first();

      const outwardTransactions = await Drive.get(
        Helpers.tmpPath(
          `outward_message/${outwardModel.reference_id}-upload.json`
        ),
        "utf8"
      );
      const parsedOutwardTransactions = JSON.parse(outwardTransactions);

      for (let txnIdx = 0; txnIdx < innerRack.length; txnIdx++) {
        const txnLookup = parsedOutwardTransactions.transactions.find(
          (txn) =>
            txn.ofiReferenceNumber ==
            transRack[keyRack[rackIdx]][txnIdx].ofiReferenceNumber
        );

        txnLookup.sequenceNumber = outwardModel.sequence_number;
        txnLookup.settlementDate = outwardModel.settlement_date;
        txns.push(txnLookup);
      }
    }

    return txns;
  }

  static async generateInwardTransactions(date) {
    const settlementDate = moment(date, "YYYY-MM-DD").format("YYYYMMDD");

    let txns = JSON.parse(
      await Drive.get(
        Helpers.tmpPath(`consolidated_inward/${settlementDate}/message.json`),
        "utf8"
      )
    ).map((txn) => {
      return {
        settlementDate: moment(date, "YYYY-MM-DD").format("MMMM D, YYYY"),
        ...txn,
      };
    });

    return txns;
  }

  static parseAmount(amount) {
    const amt = `${amount}`.replace(/,/g, "");

    return (+amt).toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }
}

module.exports = Service;
