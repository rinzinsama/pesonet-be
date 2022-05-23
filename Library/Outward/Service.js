"use strict";
const TransactionList = use("App/Models/TransactionList");
const Outward = use("App/Models/Outward");
const Drive = use("Drive");
const Helpers = use("Helpers");
const moment = use("moment");
const APIService = use("App/Controllers/Services/Api");

class Service {
  constructor(data) {
    this.outwardMessage = data;
    this.transactions = [];
  }

  async getBankBIC() {
    const bic = await Drive.get(Helpers.tmpPath("bank.txt"), "utf8");

    return bic;
  }

  parseAmount(amount) {
    let amt = (+amount / 100).toFixed(2);

    amt = (+amt).toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

    return `${amt}`;
  }

  generateLine(trans) {
    return {
      controlIdentifier: trans.substring(0, 1).trim(),
      clearingDate: trans.substring(1, 9).trim(),
      sendingBankBRSTN: trans.substring(9, 18).trim(),
      ofiReferenceNumber: trans.substring(18, 34).trim(),
      rfiReferenceNumber: trans.substring(34, 50).trim(),
      ofiCustomerReferenceNumber: trans.substring(50, 66).trim(),
      rfiCustomerReferenceNumber: trans.substring(66, 82).trim(),
      receivingBank: trans.substring(82, 91).trim(),
      transactionCode: trans.substring(91, 92).trim(),
      currencyCode: trans.substring(92, 93).trim(),
      chargeCode: trans.substring(93, 94).trim(),
      activityCode: trans.substring(94, 97).trim(),
      amount: this.parseAmount(trans.substring(97, 111).trim()),
      remitterAccountNumber: trans.substring(111, 127).trim(),
      beneficiaryAccountNumber: trans.substring(127, 143).trim(),
      beneficiaryName: trans.substring(143, 193).trim(),
      beneficiaryAddress: trans.substring(193, 243).trim(),
      remitterName: trans.substring(243, 293).trim(),
      remitterAddress: trans.substring(293, 343).trim(),
      instructions: trans.substring(343, 482).trim(),
    };
  }

  generate() {
    const transactions = this.outwardMessage.replace(/\r/g, "").split(/\n/);

    transactions.forEach((trans) => {
      if (trans.substring(0, 1) != "I") return;

      this.transactions.push(this.generateLine(trans));
    });

    return this.transactions;
  }

  //get Details
  getTotalAmount() {
    let amount = 0;

    this.outwardMessage.transactions.forEach((data) => {
      let amt = `${data.amount}`.replace(/,/g, "");

      amount += +amt;
    });

    return amount.toFixed(2);
  }

  getDetails() {
    return {
      numberOfTransactions: this.outwardMessage.transactions.length,
      totalAmount: this.getTotalAmount(),
    };
  }

  //generate transactions
  async generateTransaction(seq, date) {
    let data = this.outwardMessage;

    const trans = data.transactions.map((txn) => {
      return {
        ofi_reference_number: txn.ofiReferenceNumber,
        rfi_reference_number: txn.rfiReferenceNumber,
        ofi_customer_reference_number: txn.ofiCustomerReferenceNumber,
        rfi_customer_reference_number: txn.rfiCustomerReferenceNumber,
        amount: txn.amount,
        remitter_name: txn.remitterName,
        remitter_account_number: txn.remitterAccountNumber,
        creditor_name: txn.beneficiaryName,
        creditor_account_number: txn.beneficiaryAccountNumber,
        sequence_number: seq,
        settlement_date: date,
        type: "OUTWARD",
      };
    });

    await TransactionList.createMany(trans);
  }

  //populate transaction from api to file
  populateTransactionFromApiToFile(apiData) {
    let transactions = this.outwardMessage;

    apiData.forEach((tx, i) => {
      transactions[i].endToEndId = tx.OrgnlEndToEndId || "PROCESSING...";
      transactions[i].status = tx.TxSts || "PROCESSING...";
      transactions[i].acceptanceDate = tx.AccptncDtTm || "PROCESSING...";
      transactions[i].remarks =
        tx.StsRsnInf.AddtlInf !== null
          ? tx.StsRsnInf.AddtlInf
          : "PROCESSING...";
      transactions[i].hasStatus = tx.TxSts ? true : false;
    });

    return transactions;
  }

  //populate transaction from raw api
  populateTransactionFromApi() {
    let transactions = this.outwardMessage.map((tx) => {
      return {
        endToEndId: tx.OrgnlEndToEndId,
        status: tx.TxSts || "PROCESSING...",
        acceptanceDate: tx.AccptncDtTm || "PROCESSING...",
        remarks:
          tx.StsRsnInf.AddtlInf !== null
            ? tx.StsRsnInf.AddtlInf
            : "PROCESSING...",
        ofiReferenceNumber: tx.OrgnlTxId,
        amount: tx.OrgnlTxRef.Amt.EqvtAmt.Amt
          ? `${tx.OrgnlTxRef.Amt.EqvtAmt.Amt}`
          : "0",
        remitterName: "",
        remitterAddress: "",
        remitterAccountNumber: "",
        remitterBIC: "",
        beneficiaryName: tx.OrgnlTxRef.Cdtr.Nm || "PROCESSING...",
        beneficiaryAddress: "",
        beneficiaryAccountNumber:
          tx.OrgnlTxRef.CdtrAcct.Id.Othr.Id || "PROCESSING...",
        beneficiaryBIC:
          tx.OrgnlTxRef.CdtrAgt.FinInstnId.BICFI || "PROCESSING...",
        rfiReferenceNumber: "",
        ofiCustomerReferenceNumber: "",
        rfiCustomerReferenceNumber: "",
        instructions: "",
        hasStatus: tx.TxSts ? true : false,
      };
    });

    return transactions;
  }

  async hasStatus(id) {
    const { transactions } = this.outwardMessage;
    const outward = await Outward.findBy("id", id);
    const withStatusCount = transactions.filter((txn) => txn.hasStatus).length;

    if (withStatusCount) {
      const status = withStatusCount == transactions.length ? 4 : 3;
      const {
        numberOfTransactions: number_of_transaction,
        totalAmount: total_amount,
      } = this.getDetails();

      let merge = {};
      if (status != outward.status) merge = { status };

      if (
        number_of_transaction != outward.number_of_transaction ||
        total_amount != outward.total_amount
      )
        merge = { status, number_of_transaction, total_amount };

      if (Object.keys(merge).length > 0) {
        outward.merge(merge);
        await outward.save();
      }

      await this.checkStatusChanges(outward, transactions);
    }
  }

  async checkStatusChanges(outward, transactions) {
    if (![3, 4].includes(outward.status)) return;

    let bic = "";
    const outwardExist = await Drive.exists(
      Helpers.tmpPath(`outward_message/${outward.reference_id}-upload.json`)
    );

    if (!outwardExist && outward.status == 4) {
      await this.generateTransaction(
        outward.sequence_number,
        moment(outward.settlement_date, "MMMM D, YYYY").format("YYYY/MM/DD")
      );

      bic = await this.getBankBIC();
    }

    const txnKeys = Object.keys(transactions).map(Number);
    const txnWithStatusIdx = txnKeys.filter(
      (idx) => transactions[idx].hasStatus
    );

    const outwardMessage = outwardExist
      ? await Drive.get(
          Helpers.tmpPath(
            `outward_message/${outward.reference_id}-upload.json`
          ),
          "utf8"
        )
      : {
          bicOfBank: bic,
          transactions,
        };

    let changeCount = 0;
    const parsedTransactions = outwardExist
      ? JSON.parse(outwardMessage)
      : outwardMessage;

    if (outwardExist) {
      parsedTransactions.transactions.forEach((txn, key) => {
        if (txnWithStatusIdx.includes(key)) {
          if (!txn.status) {
            parsedTransactions.transactions[key].endToEndId =
              transactions[key].endToEndId;
            parsedTransactions.transactions[key].status =
              transactions[key].status;
            parsedTransactions.transactions[key].acceptanceDate =
              transactions[key].acceptanceDate;
            parsedTransactions.transactions[key].remarks =
              transactions[key].remarks;

            changeCount++;
          }
        }
      });
    }

    if (changeCount || !outwardExist)
      await Drive.put(
        `${Helpers.tmpPath("outward_message")}/${
          outward.reference_id
        }-upload.json`,
        JSON.stringify(parsedTransactions, null, 4)
      );
  }

  //sanitize special characters
  sanitizeSpecialCharacters() {
    let txn = this.outwardMessage;

    txn.remitterName = txn.remitterName.replace(/&/g, "and");
    txn.remitterAddress = txn.remitterAddress.replace(/&/g, "and");
    txn.instructions = txn.instructions.replace(/&/g, "and");

    txn.ofiReferenceNumber = txn.ofiReferenceNumber.replace(
      /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
      " "
    );
    txn.remitterName = txn.remitterName.replace(
      /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
      " "
    );
    txn.remitterAddress = txn.remitterAddress.replace(
      /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
      " "
    );
    txn.remitterAccountNumber = txn.remitterAccountNumber.replace(
      /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
      " "
    );
    txn.beneficiaryName = txn.beneficiaryName.replace(
      /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
      " "
    );
    txn.beneficiaryAddress = txn.beneficiaryAddress.replace(
      /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
      " "
    );
    txn.beneficiaryAccountNumber = txn.beneficiaryAccountNumber.replace(
      /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
      " "
    );
    txn.rfiReferenceNumber = txn.rfiReferenceNumber.replace(
      /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
      " "
    );
    txn.ofiCustomerReferenceNumber = txn.ofiCustomerReferenceNumber.replace(
      /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
      " "
    );
    txn.rfiCustomerReferenceNumber = txn.rfiCustomerReferenceNumber.replace(
      /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
      " "
    );
    txn.instructions = txn.instructions.replace(
      /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
      " "
    );

    return txn;
  }

  static async checkLocalExternalCodes(localExternalCodes, user) {
    const txns = await Promise.all(
      localExternalCodes.map(async (lec) => {
        return await APIService.sendOutwardMessageSearch(lec, user);
      })
    );

    return txns.filter((txn) => txn.status == 200);
  }

  static async validateOutwardMessages(txns, referenceId) {
    const outward = await Outward.findBy("reference_id", referenceId);
    const _transactions = await Drive.get(
      `${Helpers.tmpPath("outward_message")}/${referenceId}-upload.json`,
      "utf8"
    );
    const { bicOfBank, transactions } = JSON.parse(_transactions);
    const msgDeets = txns.map((txn) => ({
      id: txn.body.data.GrpHdr.MsgId,
      date: txn.body.data.GrpHdr.CreDtTm,
    }));

    const forUpdating = txns.map((txn) =>
      txn.body.data.TxInfAndSts.map((tx) => tx.OrgnlTxId)
    );

    let txnUpdate = {};

    transactions.forEach((txn, idx) => {
      const theIdx = forUpdating.findIndex(
        (fSub) => fSub.includes(txn.ofiReferenceNumber) && !txn.sent
      );

      if (theIdx != -1) {
        transactions[idx].sent = true;

        txnUpdate[theIdx] = txnUpdate[theIdx]
          ? [...txnUpdate[theIdx], txn]
          : [txn];
      }
    });

    if (Object.values(txnUpdate).length > 0) {
      const deets = await Promise.all(
        msgDeets.map(async ({ id, date }) => {
          return await Service.searchMessageId(id, date);
        })
      );
      const transactionKeys = Object.keys(txnUpdate);

      let settlementDateRack = [];
      let sequenceNumberRack = [];
      let originalSequenceRack = outward.sequence_number
        ? outward.sequence_number.split(", ")
        : [];
      let originalSequenceCount = originalSequenceRack.length;
      let originalSettlementDateRack = outward.settlement_date
        ? outward.settlement_date.split(" - ")
        : [];

      for (let index = 0; index < transactionKeys.length; index++) {
        sequenceNumberRack.push(deets[+transactionKeys[index]].seq);
        settlementDateRack.push(
          moment(deets[+transactionKeys[index]].date, "YYYY/MM/DD").format(
            "MMMM D, YYYY"
          )
        );

        const parser = new Service({
          bicOfBank,
          transactions: txnUpdate[transactionKeys[index]],
        });

        await parser.generateTransaction(
          deets[+transactionKeys[index]].seq,
          deets[+transactionKeys[index]].date
        );

        await Drive.put(
          `${Helpers.tmpPath("outward_message")}/${
            outward.reference_id
          }-batch-${originalSequenceCount + index + 1}.json`,
          JSON.stringify(
            { bicOfBank, transactions: txnUpdate[transactionKeys[index]] },
            null,
            4
          )
        );

        await Drive.put(
          `${Helpers.tmpPath("outward_message")}/${
            outward.reference_id
          }-upload.json`,
          JSON.stringify({ bicOfBank, transactions }, null, 4)
        );
      }

      let sentCount = transactions.filter((txn) => txn.sent).length;

      let forMerging = {
        number_of_batch: originalSequenceCount + transactionKeys.length,
        sequence_number: [...originalSequenceRack, ...sequenceNumberRack].join(
          ", "
        ),
        settlement_date: [
          ...originalSettlementDateRack,
          ...settlementDateRack,
        ].join(" - "),
        status: sentCount == transactions.length ? 2 : 1,
      };

      const detailsParser = new Service({
        bicOfBank,
        transactions,
      });

      const {
        numberOfTransactions: number_of_transaction,
        totalAmount: total_amount,
      } = await detailsParser.getDetails();

      if (total_amount != outward.total_amount) {
        forMerging = {
          ...forMerging,
          number_of_transaction,
          total_amount,
        };
      }

      outward.merge(forMerging);

      await outward.save();

      const indexes = await Drive.get(Helpers.tmpPath(`indexes/index.json`));
      const indexesData = JSON.parse(indexes.toString());
      indexesData.outward = [...indexesData.outward, ...sequenceNumberRack];

      await Drive.put(
        `${Helpers.tmpPath("indexes")}/index.json`,
        JSON.stringify(indexesData, null, 4)
      );
    }
  }

  static async searchMessageId(id, date) {
    let found = 0;
    let settlement_date = "";
    let dateIndex = 0;

    do {
      const { status, body } = await APIService.sendIndex({
        cycle: 1,
        settlementDate: moment(date, "x")
          .add(dateIndex, "day")
          .format("YYYY-MM-DD"),
      });

      if (status == 200 && body.data.index.outward_batches.includes(id)) {
        settlement_date = moment(date, "x")
          .add(dateIndex, "day")
          .format("YYYY/MM/DD");
        found = 1;
      }

      dateIndex++;
    } while (found == 0);

    return { seq: id, date: settlement_date };
  }
}

module.exports = Service;
