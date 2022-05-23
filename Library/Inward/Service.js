"use strict";
const moment = use("moment");
const Drive = use("Drive");
const Helpers = use("Helpers");
const TransactionList = use("App/Models/TransactionList");
const APIService = use("App/Controllers/Services/Api");
const FileGenerator = use("Library/FileGenerator/Factory");
const Inward = use("App/Models/Inward");
const User = use("App/Models/User");
const { v4: uuidv4 } = use("uuid");

class Service {
  constructor(data) {
    this.inwardMessage = data.FIToFICstmrCdtTrf;
    this.transactions = [];
    this.list = {};
  }

  padString(string, length, position, value) {
    return position == "start"
      ? string.padStart(length, value)
      : string.padEnd(length, value);
  }

  stringLengthCheck(
    string,
    allowedLength,
    padPosition = "start",
    padValue = " "
  ) {
    let returnString = "";

    if (`${string}`.length > allowedLength)
      returnString = `${string}`.substring(0, allowedLength);
    else if (`${string}`.length < allowedLength)
      returnString = this.padString(
        `${string}`,
        allowedLength,
        padPosition,
        padValue
      );
    else returnString = `${string}`;

    return returnString;
  }

  sanitizeAmount(amount) {
    let amt = amount ? `${amount}`.replace(/,/g, "") : 0;

    amt = (+amt).toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

    return `${amt}`.replace(/,|\./g, "");
  }

  generateAddress(address) {
    return address.join("");
  }

  getBRSTN(BIC) {
    const bank = this.list.PESONetMemberBanks.filter(
      (data) => data.BICFI == BIC
    );

    return bank.length > 0 ? bank[0].pchc.head_office_brstn : null;
  }

  generateLine(txn) {
    const sendingBRSTN = this.getBRSTN(txn.DbtrAgt.FinInstnId.BICFI || "");
    const receivingBRSTN = this.getBRSTN(txn.CdtrAgt.FinInstnId.BICFI || "");

    let line = "";

    line += "I";
    line += moment(
      this.inwardMessage.GrpHdr.IntrBkSttlmDt,
      "YYYY-MM-DD"
    ).format("YYYYMMDD");
    line += sendingBRSTN;
    line += this.stringLengthCheck(txn.PmtId.TxId || "", 16, "end");
    line += this.stringLengthCheck(
      txn.RmtInf.Ustrd.rfi_reference_number || "",
      16,
      "end"
    );
    line += this.stringLengthCheck(
      txn.RmtInf.Ustrd.ofi_customer_reference_number || "",
      16,
      "end"
    );
    line += this.stringLengthCheck(
      txn.RmtInf.Ustrd.rfi_customer_reference_number || "",
      16,
      "end"
    );
    line += receivingBRSTN;
    line += "0";
    line += "0";
    line += "0";
    line += this.stringLengthCheck("", 3, "end");
    line += this.stringLengthCheck(
      this.sanitizeAmount(txn.IntrBkSttlmAmt.value),
      14,
      "start",
      "0"
    );
    line += this.stringLengthCheck(
      txn.DbtrAcct.Id.Othr.Id || "",
      16,
      "start",
      "0"
    );
    line += this.stringLengthCheck(
      txn.CdtrAcct.Id.Othr.Id || "",
      16,
      "start",
      "0"
    );
    line += this.stringLengthCheck(txn.Cdtr.Nm || "", 50, "end");
    line += this.stringLengthCheck(
      this.generateAddress(txn.Cdtr.PstlAdr || ""),
      50,
      "end"
    );
    line += this.stringLengthCheck(txn.Dbtr.Nm || "", 50, "end");
    line += this.stringLengthCheck(
      this.generateAddress(txn.Dbtr.PstlAdr || ""),
      50,
      "end"
    );
    line += this.stringLengthCheck("", 4, "end");
    line += this.stringLengthCheck("", 4, "end");
    line += this.stringLengthCheck("", 10, "end");
    line += this.stringLengthCheck(
      txn.RmtInf.Ustrd.instructions || "",
      139,
      "end"
    );

    this.transactions.push(line);
  }

  async generate() {
    const list = (
      await Drive.get(Helpers.tmpPath("bank_list/list.json"))
    ).toString();

    this.list = JSON.parse(list);

    this.inwardMessage.CdtTrfTxInf.forEach((transaction) => {
      this.generateLine(transaction);
    });

    await Drive.put(
      `${Helpers.tmpPath("inward_file")}/${this.inwardMessage.GrpHdr.MsgId}/${
        this.inwardMessage.GrpHdr.MsgId
      }.INC`,
      this.transactions.join("\n")
    );

    return true;
  }

  //for TGS/HOTSCAN
  parseAmount(amount) {
    let amt = amount ? `${amount}`.replace(/,/g, "") : 0;

    amt = (+amt).toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

    return `${amt}`.replace(/,/g, "");
  }

  getBankName(BIC) {
    const bank = this.list.PESONetMemberBanks.filter(
      (data) => data.BICFI == BIC
    );

    return bank.length > 0 ? bank[0].bank_name : null;
  }

  generateTransactionsForValidation(stripAcctNo) {
    const genTxns = {
      dates: this.inwardMessage.CdtTrfTxInf.map((data) =>
        moment(this.inwardMessage.GrpHdr.IntrBkSttlmDt, "YYYY-MM-DD").format(
          "MM/DD/YYYY"
        )
      ),
      senderName: this.inwardMessage.CdtTrfTxInf.map((data) => data.Dbtr.Nm),
      currency: this.inwardMessage.CdtTrfTxInf.map(
        (data) => data.IntrBkSttlmAmt.Ccy
      ),
      amount: this.inwardMessage.CdtTrfTxInf.map((data) =>
        this.parseAmount(data.IntrBkSttlmAmt.value)
      ),
      accountNumbers: this.inwardMessage.CdtTrfTxInf.map((data) => {
        return stripAcctNo
          ? data.CdtrAcct.Id.Othr.Id.substr(data.CdtrAcct.Id.Othr.Id.length - 6)
          : data.CdtrAcct.Id.Othr.Id;
      }),
      notes: this.inwardMessage.CdtTrfTxInf.map((data) => {
        const referenceId = data.PmtId.TxId;
        const remarks = data.RmtInf.Ustrd.instructions || "";

        return `${referenceId} /${remarks}`;
      }),
      maker: this.inwardMessage.CdtTrfTxInf.map((data) =>
        this.generateAddress(data.Dbtr.PstlAdr)
      ),
      checker: this.inwardMessage.CdtTrfTxInf.map((data) => {
        const bic = data.DbtrAgt.FinInstnId.BICFI;
        const bankName = this.getBankName(data.DbtrAgt.FinInstnId.BICFI);
        return `${bic}/${bankName}`;
      }),
      reference: this.inwardMessage.CdtTrfTxInf.map((data) => {
        const beneName = data.Cdtr.Nm;
        const beneAdd = this.generateAddress(data.Cdtr.PstlAdr);

        return `${beneName} ${beneAdd}`;
      }),
      fullAccountNumbers: this.inwardMessage.CdtTrfTxInf.map((data) => {
        return data.CdtrAcct.Id.Othr.Id;
      }),
    };

    return genTxns;
  }

  async generateValidation(stripAcctNo = true) {
    const list = (
      await Drive.get(Helpers.tmpPath("bank_list/list.json"))
    ).toString();

    this.list = JSON.parse(list);

    return this.generateTransactionsForValidation(stripAcctNo);
  }

  getTotalAmount() {
    let amount = 0;

    this.inwardMessage.CdtTrfTxInf.forEach((data) => {
      amount += +data.IntrBkSttlmAmt.value;
    });

    return amount;
  }

  //get Details
  getDetails() {
    return {
      numberOfTransactions: this.inwardMessage.CdtTrfTxInf.length,
      totalAmount: this.getTotalAmount(),
    };
  }

  //generate inward message
  async generateInwardMessage() {
    let data = this.inwardMessage;

    data.CdtTrfTxInf.forEach((txn, idx) => {
      data.CdtTrfTxInf[idx].status = 0;
      data.CdtTrfTxInf[idx].remarks = "";
    });

    await Drive.put(
      `${Helpers.tmpPath("inward_message")}/${
        this.inwardMessage.GrpHdr.MsgId
      }.json`,
      JSON.stringify(data, null, 4)
    );
  }

  //generate transactions
  async generateTransaction() {
    let data = this.inwardMessage;

    const trans = data.CdtTrfTxInf.map((txn) => {
      return {
        ofi_reference_number: txn.PmtId.TxId,
        rfi_reference_number: txn.RmtInf.Ustrd.rfi_reference_number,
        ofi_customer_reference_number:
          txn.RmtInf.Ustrd.ofi_customer_reference_number,
        rfi_customer_reference_number:
          txn.RmtInf.Ustrd.rfi_customer_reference_number,
        amount: txn.IntrBkSttlmAmt.value,
        remitter_name: txn.Dbtr.Nm,
        remitter_account_number: txn.DbtrAcct.Id.Othr.Id,
        creditor_name: txn.Cdtr.Nm,
        creditor_account_number: txn.CdtrAcct.Id.Othr.Id,
        sequence_number: data.GrpHdr.MsgId,
        settlement_date: data.GrpHdr.IntrBkSttlmDt,
        type: "INWARD",
      };
    });

    await TransactionList.createMany(trans);
  }

  //generate JSON structure for pdf
  parseDisplayAmount(amount) {
    const amt = `${amount}`.replace(/,/g, "");

    return (+amt).toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  getStatusMessage(status) {
    let statusMessage = "";

    if (status == 0) statusMessage = "FOR STATUS UPDATE";
    else if (status == 1) statusMessage = "FOR APPROVAL";
    else if (status == 2) statusMessage = "PARTIALLY UPDATED";
    else if (status == 3) statusMessage = "SUCCESSFUL STATUS UPDATE";
    else if (status == -2) statusMessage = "FAILED STATUS UPDATE";
    else if (status == -3) statusMessage = "REJECTED";

    return statusMessage;
  }

  generatePDFJSON(outwardParsed) {
    let { CdtTrfTxInf: data } = this.inwardMessage;

    outwardParsed.totalAmount = this.parseDisplayAmount(
      outwardParsed.totalAmount
    );

    const txn = data.map((txn) => {
      return {
        batchId: outwardParsed.sequenceNumber,
        endToEndId: txn.PmtId.EndToEndId,
        ofiReferenceNumber: txn.PmtId.TxId,
        ofiCustomerReferenceNumber:
          txn.RmtInf.Ustrd.ofi_customer_reference_number,
        rfiReferenceNumber: txn.RmtInf.Ustrd.rfi_reference_number,
        rfiCustomerReferenceNumber:
          txn.RmtInf.Ustrd.rfi_customer_reference_number,
        amount: this.parseDisplayAmount(txn.IntrBkSttlmAmt.value),
        instructions: txn.RmtInf.Ustrd.instructions,
        remitterName: txn.Dbtr.Nm,
        remitterAddress: txn.Dbtr.PstlAdr.join(""),
        remitterAccountNumber: txn.DbtrAcct.Id.Othr.Id,
        remitterBIC: txn.DbtrAgt.FinInstnId.BICFI,
        beneficiaryName: txn.Cdtr.Nm,
        beneficiaryAddress: txn.Cdtr.PstlAdr.join(""),
        beneficiaryAccountNumber: txn.CdtrAcct.Id.Othr.Id,
        beneficiaryBIC: txn.CdtrAgt.FinInstnId.BICFI,
        taggedStatus: txn.status != 0 ? true : false,
        status: txn.status,
        remarks: txn.remarks,
      };
    });

    return {
      ref: outwardParsed,
      txn,
      status: this.getStatusMessage(outwardParsed.status),
    };
  }

  //======================================================================================

  static sanitizeBody(body) {
    let transaction = body;

    transaction.FIToFICstmrCdtTrf.CdtTrfTxInf.forEach((data, idx) => {
      if (data.PmtId.TxId)
        transaction.FIToFICstmrCdtTrf.CdtTrfTxInf[
          idx
        ].PmtId.TxId = data.PmtId.TxId.replace(
          /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
          " "
        );

      if (data.Dbtr.Nm)
        transaction.FIToFICstmrCdtTrf.CdtTrfTxInf[
          idx
        ].Dbtr.Nm = data.Dbtr.Nm.trim().replace(
          /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
          " "
        );

      if (data.Dbtr.PstlAdr.length > 0)
        transaction.FIToFICstmrCdtTrf.CdtTrfTxInf[
          idx
        ].Dbtr.PstlAdr = data.Dbtr.PstlAdr.map((d) => {
          return d.trim().replace(/[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g, " ");
        });

      if (data.DbtrAcct.Id.Othr.Id)
        transaction.FIToFICstmrCdtTrf.CdtTrfTxInf[
          idx
        ].DbtrAcct.Id.Othr.Id = data.DbtrAcct.Id.Othr.Id.trim().replace(
          /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
          " "
        );

      if (data.Cdtr.Nm)
        transaction.FIToFICstmrCdtTrf.CdtTrfTxInf[
          idx
        ].Cdtr.Nm = data.Cdtr.Nm.trim().replace(
          /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
          " "
        );

      if (data.Dbtr.PstlAdr.length > 0)
        transaction.FIToFICstmrCdtTrf.CdtTrfTxInf[
          idx
        ].Cdtr.PstlAdr = data.Dbtr.PstlAdr.map((d) => {
          return d.trim().replace(/[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g, " ");
        });

      if (data.CdtrAcct.Id.Othr.Id)
        transaction.FIToFICstmrCdtTrf.CdtTrfTxInf[
          idx
        ].CdtrAcct.Id.Othr.Id = data.CdtrAcct.Id.Othr.Id.trim().replace(
          /[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g,
          " "
        );

      if (data.RmtInf.Ustrd.rfi_reference_number)
        transaction.FIToFICstmrCdtTrf.CdtTrfTxInf[
          idx
        ].RmtInf.Ustrd.rfi_reference_number = data.RmtInf.Ustrd.rfi_reference_number
          .trim()
          .replace(/[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g, " ");

      if (data.RmtInf.Ustrd.ofi_customer_reference_number)
        transaction.FIToFICstmrCdtTrf.CdtTrfTxInf[
          idx
        ].RmtInf.Ustrd.ofi_customer_reference_number = data.RmtInf.Ustrd.ofi_customer_reference_number
          .trim()
          .replace(/[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g, " ");

      if (data.RmtInf.Ustrd.rfi_customer_reference_number)
        transaction.FIToFICstmrCdtTrf.CdtTrfTxInf[
          idx
        ].RmtInf.Ustrd.rfi_customer_reference_number = data.RmtInf.Ustrd.rfi_customer_reference_number
          .trim()
          .replace(/[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g, " ");

      if (data.RmtInf.Ustrd.rfi_customer_reference_number)
        transaction.FIToFICstmrCdtTrf.CdtTrfTxInf[
          idx
        ].RmtInf.Ustrd.instructions = data.RmtInf.Ustrd.instructions
          .trim()
          .replace(/[^a-zA-Z0-9\/\-\?:\(\)\.,'\+ ]/g, " ");
    });

    return transaction;
  }

  static async generateTransaction(sequence_number, settlement_date, user) {
    const inwardIndex = await Drive.get(
      Helpers.tmpPath("inward_index.json"),
      "utf8"
    );
    const parsedInwardIndex = JSON.parse(inwardIndex);
    const { status, body: inwardBody } = await APIService.sendInwardBatch(
      sequence_number,
      user
    );

    if (status != 200) throw Error("Syncing failed.");

    const body = Service.sanitizeBody(inwardBody.data);

    const generator = new Service(body);

    const {
      numberOfTransactions: number_of_transaction,
      totalAmount: total_amount,
    } = await generator.getDetails();

    const parsedSettlementDate = moment(settlement_date, "YYYY-MM-DD").format(
      "YYYYMMDD"
    );

    const count = parsedInwardIndex[parsedSettlementDate] || 0;

    await Service.generateFiles(body, sequence_number, count);

    parsedInwardIndex[parsedSettlementDate] = +count + +number_of_transaction;

    await Drive.put(
      Helpers.tmpPath("inward_index.json"),
      JSON.stringify(parsedInwardIndex, null, 4)
    );

    // await generator.generate();
    await Service.generateConsolidatedInward(
      body,
      sequence_number,
      parsedSettlementDate,
      count
    );
    await generator.generateInwardMessage();
    await generator.generateTransaction();

    const inwardInstance = await Inward.findBy(
      "sequence_number",
      sequence_number
    );

    inwardInstance.merge({ number_of_transaction, total_amount });
    await inwardInstance.save();
  }

  static async generateFiles(data, sequenceNumber, count = 0) {
    const generator = new Service(data);

    const validationDataHotScan = await generator.generateValidation(false);
    const validationDataTgs = await generator.generateValidation();

    const HotScanGenerator = new FileGenerator(
      1,
      validationDataHotScan,
      `HotScan${sequenceNumber}.tsv`,
      `${Helpers.tmpPath("inward_file")}/${sequenceNumber}`,
      count
    );

    const TGSGenerator = new FileGenerator(
      2,
      validationDataTgs,
      `TGS${sequenceNumber}.tsv`,
      `${Helpers.tmpPath("inward_file")}/${sequenceNumber}`,
      count
    );

    await HotScanGenerator.generate();
    await TGSGenerator.generate();
  }

  static async generateConsolidatedInward(
    data,
    sequenceNumber,
    settlementDate,
    idxStart
  ) {
    const filename = `consolidated_inward/${settlementDate}/message.json`;

    const exist = await Drive.exists(filename);
    const { FIToFICstmrCdtTrf } = data;

    const txns = FIToFICstmrCdtTrf.CdtTrfTxInf.map((txn, idx) => {
      return {
        index: idx + idxStart,
        sequenceNumber,
        endToEndId: txn.PmtId.EndToEndId,
        ofiReferenceNumber: txn.PmtId.TxId,
        ofiCustomerReferenceNumber:
          txn.RmtInf.Ustrd.ofi_customer_reference_number,
        rfiReferenceNumber: txn.RmtInf.Ustrd.rfi_reference_number,
        rfiCustomerReferenceNumber:
          txn.RmtInf.Ustrd.rfi_customer_reference_number,
        amount: txn.IntrBkSttlmAmt.value,
        instructions: txn.RmtInf.Ustrd.instructions,
        remitterName: txn.Dbtr.Nm,
        remitterAddress: txn.Dbtr.PstlAdr,
        remitterAccountNumber: txn.DbtrAcct.Id.Othr.Id,
        remitterBIC: txn.DbtrAgt.FinInstnId.BICFI,
        beneficiaryName: txn.Cdtr.Nm,
        beneficiaryAddress: txn.Cdtr.PstlAdr,
        beneficiaryAccountNumber: txn.CdtrAcct.Id.Othr.Id,
        beneficiaryBIC: txn.CdtrAgt.FinInstnId.BICFI,
        status: "DS07",
        remarks: "",
        flowStatus: 1,
        isRejected: false,
      };
    });

    let consolidatedData = [];

    if (exist) {
      const consolidatedInwardMessage = await Drive.get(filename, "utf8");
      const parsedConsolidatedInwardMessage = JSON.parse(
        consolidatedInwardMessage
      );

      consolidatedData = [...parsedConsolidatedInwardMessage, ...txns];
    } else consolidatedData = txns;

    await Drive.put(filename, JSON.stringify(consolidatedData, null, 4));
  }

  static async createInwardLog(date, type, user, txns = []) {
    const settlementDate = moment(date, "YYYY-MM-DD").format("YYYYMMDD");
    const filePath = `consolidated_inward/${settlementDate}/log.json`;
    const exist = await Drive.exists(filePath);

    const userModel = await User.findBy("username", user);
    if (!userModel) return;

    await userModel.load("role");
    const userCollection = userModel.toJSON();
    const name = userCollection.fullname;
    const totalTxns = typeof txns == "object" ? 0 : txns.length;
    const logId = uuidv4();

    const template = {
      sync: {
        action: "SYNC",
        description: `${name} triggered inward sync.`,
      },
      resync: {
        action: "RE-SYNC",
        description: `${name} triggered inward re-sync.`,
      },
      update: {
        action: "UPDATE STATUS",
        description: `${name} updated (${totalTxns}) transaction/s.`,
      },
      reject: {
        action: "REJECT STATUS",
        description: `${name} rejected (${totalTxns}) transaction/s.`,
      },
      send: {
        action: "SEND STATUS",
        description: `${name} sent inward transaction/s.`,
      },
      regenerate: {
        action: "REGENERATE",
        description: `${name} regenerated inward files.`,
      },
      download_tgs: {
        action: "DOWNLOAD",
        description: `${name} downloaded tgs files.`,
      },
      download_hotscan: {
        action: "DOWNLOAD",
        description: `${name} downloaded hotscan files.`,
      },
      generate_pdf: {
        action: "GENERATE PDF",
        description: `${name} generated pdf.`,
      },
    };

    let log = [];

    if (exist) {
      const logStream = await Drive.get(filePath, "utf8");
      log = JSON.parse(logStream);
    }

    log.push({
      id: logId,
      ...template[type],
      user: userCollection,
      timestamp: moment().format("x"),
      transactions: txns.length > 0 || typeof txns == "object" ? txns : null,
    });

    await Drive.put(filePath, JSON.stringify(log, null, 4));
    return logId;
  }

  static staticParseAmount(amount) {
    let amt = amount ? `${amount}`.replace(/,/g, "") : 0;

    amt = (+amt).toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

    return amt;
  }
}

module.exports = Service;
