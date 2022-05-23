"use strict";
const BaseService = use("App/Controllers/Services/Base");
const APIService = use("App/Controllers/Services/Api");
const Inward = use("App/Models/Inward");
const Helpers = use("Helpers");
const Drive = use("Drive");
const PesonetTransaction = use("App/Models/PesonetTransaction");
const InwardFileGenerator = use("Library/Inward/Service");
const PDFGenerator = use("Library/PDFGenerator/Service");
const Encryption = use("Encryption");
const moment = use("moment");
const Socket = use("Socket");
const Database = use("Database");
const TransactionList = use("App/Models/TransactionList");

class InwardService {
  static fields() {
    return ["sequence_number", "number_of_transaction", "total_amount"];
  }

  static async getInwardBatch(request) {
    const { search, page, limit, filter, date } = request;
    let response = {};
    let query = Inward.query();

    if (`${filter}` && filter == 0) query.whereIn("status", [0, -2, -3]);
    else if (`${filter}` && filter == 1) query.whereIn("status", [1, 2]);
    else if (`${filter}` && filter == 2) query.where("status", 3);
    else if (`${filter}` && filter == 3 && date)
      query.whereRaw("CAST(settlement_date as date) = ?", date);

    if (search && search.length > 0)
      query = BaseService.searchQuery(query, InwardService.fields(), search);

    if (limit && !page) query.limit(limit);

    query.orderByRaw("sequence_number::int asc");

    const { data, ...obj } = await BaseService.getData(query, page, limit);

    if (data.length == 0) response = BaseService.noDataResponseSerializer();
    else {
      const parsedData = BaseService.camelCaseBody(data);
      response = BaseService.withDataResponseSerializer(parsedData, {
        ...obj,
      });
    }

    return response;
  }

  static async getConsolidatedInwardBatch(request) {
    const { search, page, limit, filter, date } = request;
    let response = {};
    let query = Inward.query();

    query.whereRaw("CAST(settlement_date as date) = ?", date);

    if (search && search.length > 0)
      query = BaseService.searchQuery(query, InwardService.fields(), search);

    if (limit && !page) query.limit(limit);

    query.orderByRaw("CAST(sequence_number as int) asc");

    const { data, ...obj } = await BaseService.getData(query, page, limit);

    if (data.length == 0) response = BaseService.noDataResponseSerializer();
    else {
      const parsedData = BaseService.camelCaseBody(data);
      response = BaseService.withDataResponseSerializer(parsedData, {
        ...obj,
      });
    }

    return response;
  }

  static async getConsolidatedTotals(date) {
    const totalCount = await Database.select(
      Database.raw("CAST(number_of_transaction as int) as number_of_transaction")
    )
      .from("inward")
      .whereRaw("CAST(settlement_date as date) = ?", date)
      .getSum("number_of_transaction");

    const totalAmount = await Database.select(
      Database.raw("CAST(total_amount as float) as total_amount")
    )
      .from("inward")
      .whereRaw("CAST(settlement_date as date) = ?", date)
      .getSum("total_amount");

    return BaseService.withDataResponseSerializer(
      {},
      {
        totalCount: +totalCount,
        totalAmount: +totalAmount,
      }
    );
  }

  static async getInwardMessage(refId) {
    let response = {};
    let inward = await Inward.findBy("reference_id", refId);

    if (inward) {
      const parsedData = BaseService.camelCaseBody(inward.toJSON());
      response = BaseService.withDataResponseSerializer(parsedData);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async getTransactions(refId, user) {
    let response = {};
    const inward = await Inward.findBy("reference_id", refId);

    const { sequence_number, settlement_date } = inward.toJSON();

    // await InwardService.generateTransaction(
    //   sequence_number,
    //   settlement_date,
    //   user
    // );

    const inwardMessage = await Drive.get(
      Helpers.tmpPath(`inward_message/${sequence_number}.json`)
    );

    const parsedInwardMessage = JSON.parse(inwardMessage.toString());

    return BaseService.withDataResponseSerializer({
      FIToFICstmrCdtTrf: parsedInwardMessage,
    });
  }

  static async downloadFile(request) {
    const { referenceId, type } = request;

    const inward = await Inward.findBy("reference_id", referenceId);
    const { sequence_number } = inward.toJSON();

    const ext = type == "inward" ? "INC" : "tsv";
    let filename = "";

    if (type == "inward") filename = sequence_number;
    else if (type == "hotscan") filename = `HotScan${sequence_number}`;
    else if (type == "tgs") filename = `PDDTS${sequence_number}`;

    return Helpers.tmpPath(`inward_file/${sequence_number}/${filename}.${ext}`);
  }

  static async updateStatus(request, username) {
    const { referenceId, inward } = request;
    const inwardInstance = await Inward.findBy("reference_id", referenceId);

    await Drive.put(
      `${Helpers.tmpPath("inward_message")}/${
        inwardInstance.sequence_number
      }.json`,
      JSON.stringify(inward, null, 4)
    );

    inwardInstance.merge({ status: 1 });
    await inwardInstance.save();

    const transaction = new PesonetTransaction();

    transaction.merge({
      transaction_id: inwardInstance.id,
      user: username,
      type: "INWARD",
      remarks: "Updated inward message status.",
    });

    await transaction.save();

    const parsedData = BaseService.camelCaseBody(inwardInstance.toJSON());

    return BaseService.withDataResponseSerializer(
      parsedData,
      null,
      "Successfully updated data."
    );
  }

  static async reject(request, username) {
    const { remarks, referenceId } = request;
    const inward = await Inward.findBy("reference_id", referenceId);

    inward.merge({ status: -3, remarks });
    await inward.save();

    const transaction = new PesonetTransaction();

    transaction.merge({
      transaction_id: inward.id,
      user: username,
      type: "INWARD",
      remarks: "Rejected inward message.",
    });

    await transaction.save();

    const parsedData = BaseService.camelCaseBody(inward.toJSON());

    return BaseService.withDataResponseSerializer(
      parsedData,
      null,
      "Inward batch rejected."
    );
  }

  static async sendStatus(request, user) {
    let response = {};
    const { referenceId, indexes } = request;

    const inwardInstance = await Inward.findBy("reference_id", referenceId);

    const inwardMessage = await Drive.get(
      Helpers.tmpPath(`inward_message/${inwardInstance.sequence_number}.json`)
    );

    const parsedInwardMessage = JSON.parse(inwardMessage.toString());

    const { GrpHdr: header, CdtTrfTxInf: transactions } = parsedInwardMessage;
    let inwardStatusData = {
      bicOfBank: header.InstdAgt.FinInstnId.BICFI,
      originalMessageId: header.MsgId,
    };

    const txns = transactions.filter((txn, idx) => indexes.includes(idx));

    inwardStatusData.transactions = txns.map((data) => {
      return {
        endToEndId: data.PmtId.EndToEndId,
        transactionStatus: data.status,
        remarks: data.remarks,
        creditedAmount: data.IntrBkSttlmAmt.value,
        beneficiaryName: data.Cdtr.Nm,
        beneficiaryAccountNumber: data.CdtrAcct.Id.Othr.Id,
        beneficiaryBIC: data.CdtrAgt.FinInstnId.BICFI,
      };
    });

    indexes.forEach((idx) => {
      transactions[idx].sentStatus = true;
    });

    const inwardUpdate = await APIService.sendInwardBatchStatusUpdate(
      inwardStatusData,
      user
    );

    if (inwardUpdate.body.responseStatus == 200) {
      const totalUpdated = transactions.filter((txn) => txn.sentStatus);
      const status = totalUpdated.length == transactions.length ? 3 : 2;

      inwardInstance.merge({ status });
      await inwardInstance.save();

      await Drive.put(
        `${Helpers.tmpPath("inward_message")}/${
          inwardInstance.sequence_number
        }.json`,
        JSON.stringify({ GrpHdr: header, CdtTrfTxInf: transactions }, null, 4)
      );

      const parsedData = BaseService.camelCaseBody(inwardInstance.toJSON());

      response = BaseService.withDataResponseSerializer(
        parsedData,
        null,
        "Successfully sent status."
      );
    } else {
      inwardInstance.merge({
        status: -2,
        remarks: inwardUpdate.body.data.error.message,
      });
      await inwardInstance.save();

      const parsedData = BaseService.camelCaseBody(inwardInstance.toJSON());

      response = BaseService.withDataResponseSerializer(
        parsedData,
        null,
        `Status sent with errors. Error: ${inwardUpdate.body.data.error.message}`
      );
    }

    const transaction = new PesonetTransaction();

    transaction.merge({
      transaction_id: inwardInstance.id,
      user,
      type: "INWARD",
      remarks: `Approved and sent ${indexes.length} inward message/s.`,
    });

    await transaction.save();

    return response;
  }

  static async generatePDF(ref) {
    const inward = await Inward.findBy("reference_id", ref);
    const templatePath = "pdf_template/inward.html";
    const filePath = `pdf/inward/${inward.reference_id}.pdf`;

    const inwardMessage = await Drive.get(
      Helpers.tmpPath(`inward_message/${inward.sequence_number}.json`),
      "utf8"
    );
    const parsedInwardMessage = {
      FIToFICstmrCdtTrf: JSON.parse(inwardMessage),
    };
    let parsedInward = BaseService.camelCaseBody(inward.toJSON());

    const inwardService = new InwardFileGenerator(parsedInwardMessage);
    const data = inwardService.generatePDFJSON(parsedInward);

    const pdfInstance = new PDFGenerator(templatePath, data, filePath);
    await pdfInstance.generatePDF();

    const encryptedData = Encryption.encrypt(inward.reference_id);
    const hash = Buffer.from(encryptedData).toString("base64");

    return BaseService.withDataResponseSerializer(
      { link: `${hash}/Inward Message` },
      null,
      `Successfully generated link.`
    );
  }

  static async generateFilePDF(rack) {
    const templatePath = "pdf_template/inward.html";
    const ms = moment().format("x");
    const filePath = `pdf/inward_group/${ms}.pdf`;

    const inwardMessage = await Promise.all(
      rack
        .sort((a, b) => +a - +b)
        .map(async (fl) => {
          const msg = await Drive.get(
            Helpers.tmpPath(`inward_message/${fl}.json`),
            "utf8"
          );

          const inward = await Inward.findBy("sequence_number", fl);

          return {
            body: JSON.parse(msg),
            model: BaseService.camelCaseBody(inward.toJSON()),
          };
        })
        .map(async (ctx) => {
          const { body, model } = await ctx;
          const msg = { FIToFICstmrCdtTrf: body };
          const inwardService = new InwardFileGenerator(msg);
          const { txn } = inwardService.generatePDFJSON(model);

          return {
            sequenceNumber: model.sequenceNumber,
            settlementDate: model.settlementDate,
            statusMessage: `(${
              model.sequenceNumber
            }) ${inwardService.getStatusMessage(model.status)}`,
            totalAmount: model.totalAmount.replace(/,/g, ""),
            numberOfTransactions: model.numberOfTransaction,
            body: txn,
          };
        })
    );

    const iService = new InwardFileGenerator({});
    const totalAmount = inwardMessage
      .map((im) => im.totalAmount)
      .reduce((a, b) => +a + +b, 0);
    const totalAmountParsed = iService.parseDisplayAmount(
      totalAmount.toFixed(2)
    );

    const ref = {
      sequenceNumber: inwardMessage.map((im) => im.sequenceNumber).join(","),
      settlementDate: Array.from(
        new Set(inwardMessage.map((im) => im.settlementDate))
      ),
      numberOfTransaction: inwardMessage
        .map((im) => im.numberOfTransactions)
        .reduce((a, b) => +a + +b, 0),
      totalAmount: totalAmountParsed,
    };

    const data = {
      ref,
      txn: [].concat.apply(
        [],
        inwardMessage.map((im) => im.body)
      ),
      status: inwardMessage.map((im) => im.statusMessage).join(", "),
    };

    const pdfInstance = new PDFGenerator(templatePath, data, filePath);
    await pdfInstance.generatePDF();

    const encryptedData = Encryption.encrypt(`${ms}.pdf`);
    const hash = Buffer.from(encryptedData).toString("base64");

    return BaseService.withDataResponseSerializer(
      { link: `${hash}/Grouped Inward Message` },
      null,
      `Successfully generated link.`
    );
  }

  static async getTransactionForFileGeneration(date) {
    let response = {};

    const inward = await Inward.query()
      .whereRaw("CAST(settlement_date as date) = ?", date)
      .orderByRaw("CAST(sequence_number as int) asc")
      .fetch();

    if (inward.rows.length > 0) {
      const inwardData = inward.toJSON();
      const inwardGenerated = await Promise.all(
        inwardData.map(async (inData) => {
          const theDate = moment(inData.settlement_date, "MMMM D, YYYY").format(
            "YYMMDD"
          );

          const hScan = await Drive.get(
            Helpers.tmpPath(
              `inward_file/${inData.sequence_number}/HotScan${inData.sequence_number}.tsv`
            ),
            "utf8"
          );

          const regExpression = new RegExp(`IN${theDate}3696X00(.{0,5})`);

          const hScanRack = hScan.split(/\r\n|\r|\n/).filter((h) => h != "");
          const firstTxnId = hScanRack[0].match(regExpression);
          const lastTxnId = hScanRack[hScanRack.length - 1].match(
            regExpression
          );

          return {
            sequenceNumber: inData.sequence_number,
            range: `${firstTxnId[0].trim()} - ${lastTxnId[0].trim()}`,
          };
        })
      );

      response = BaseService.withDataResponseSerializer(inwardGenerated);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async downloadGroupFile(request, user) {
    const { type, file, range, settlementDate } = request;
    let txns = [];

    const fileData = await Promise.all(
      file
        .sort((a, b) => +a - +b)
        .map(async (f) => {
          const filePath = type == "hotscan" ? "HotScan" : "TGS";

          txns.push(`#${f} | ${range[f]}`);

          return await Drive.get(
            Helpers.tmpPath(`inward_file/${f}/${filePath}${f}.tsv`),
            "utf8"
          );
        })
    );

    const date = moment(settlementDate, "YYYY-MM-DD").format("YYYYMMDD");
    await InwardFileGenerator.createInwardLog(
      date,
      `download_${type}`,
      user,
      txns
    );

    return fileData.join("");
  }

  static async getConsolidatedTransactions(settlementDate) {
    let response = {};

    const date = moment(settlementDate, "YYYY-MM-DD").format("YYYYMMDD");
    const filepath = `consolidated_inward/${date}/message.json`;
    const exist = await Drive.exists(filepath);

    if (exist) {
      const consolidatedTransactions = await Drive.get(filepath, "utf8");
      const parsedConsolidatedTransactions = JSON.parse(
        consolidatedTransactions
      );

      response = BaseService.withDataResponseSerializer(
        parsedConsolidatedTransactions
      );
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async saveConsolidatedInward(request, user) {
    let response = {};
    const { settlementDate, transactions, type } = request;

    const date = moment(settlementDate, "YYYY-MM-DD").format("YYYYMMDD");
    const filepath = `consolidated_inward/${date}/message.json`;
    const exist = await Drive.exists(filepath);
    let responseMessage = "";

    if (exist) {
      const consilidatedTxns = await Drive.get(filepath, "utf8");
      let parsedConsilidatedTxns = JSON.parse(consilidatedTxns);
      let txns = [];
      let forSending = {};

      transactions.forEach((txn) => {
        const lookupIndex = parsedConsilidatedTxns.findIndex(
          (tx) => tx.index == txn.index && tx.endToEndId == txn.endToEndId
        );

        let tx = `#${parsedConsilidatedTxns[lookupIndex].sequenceNumber} - ${
          parsedConsilidatedTxns[lookupIndex].ofiReferenceNumber
        } - PHP ${InwardFileGenerator.staticParseAmount(
          parsedConsilidatedTxns[lookupIndex].amount
        )} - ${parsedConsilidatedTxns[lookupIndex].status}`;
        txns.push(tx);

        if (type == "update") {
          parsedConsilidatedTxns[lookupIndex].status = txn.status;
          parsedConsilidatedTxns[lookupIndex].remarks = txn.remarks;
          parsedConsilidatedTxns[lookupIndex].flowStatus = 2;
          parsedConsilidatedTxns[lookupIndex].isRejected = false;

          responseMessage = "Successfully updated status.";
        } else if (type == "reject") {
          parsedConsilidatedTxns[lookupIndex].flowStatus = 1;
          parsedConsilidatedTxns[lookupIndex].isRejected = true;

          responseMessage = "Successfully rejected status.";
        } else {
          const sequenceNumber =
            parsedConsilidatedTxns[lookupIndex].sequenceNumber;

          const sendObj = {
            lookup: lookupIndex,
            body: {
              endToEndId: parsedConsilidatedTxns[lookupIndex].endToEndId,
              transactionStatus: parsedConsilidatedTxns[lookupIndex].status,
              remarks: parsedConsilidatedTxns[lookupIndex].remarks,
              creditedAmount: parsedConsilidatedTxns[lookupIndex].amount,
              beneficiaryName:
                parsedConsilidatedTxns[lookupIndex].beneficiaryName,
              beneficiaryAccountNumber:
                parsedConsilidatedTxns[lookupIndex].beneficiaryAccountNumber,
              beneficiaryBIC:
                parsedConsilidatedTxns[lookupIndex].beneficiaryBIC,
            },
          };

          if (!forSending[sequenceNumber])
            forSending[sequenceNumber] = [sendObj];
          else forSending[sequenceNumber].push(sendObj);
        }
      });

      if (type == "send") {
        const bicOfBank = await Drive.get("bank.txt", "utf8");
        const forSendingKey = Object.keys(forSending);
        let sendStats = [];
        txns = [];

        for (let idxKey = 0; idxKey < forSendingKey.length; idxKey++) {
          const sqId = forSendingKey[idxKey];

          let inwardStatusData = {
            bicOfBank,
            originalMessageId: sqId,
            transactions: forSending[sqId].map(({ body }) => body),
          };

          const sendDetails = await APIService.sendInwardBatchStatusUpdate(
            inwardStatusData,
            user
          );

          sendStats.push({
            sendStatus: sendDetails,
            sequenceNumber: sqId,
          });
        }

        let totalRequest = 0;
        let totalSent = 0;
        let sentRackLogs = [];
        let failedRackLogs = [];
        let remarks = null;

        sendStats.forEach(({ sendStatus: stats, sequenceNumber }) => {
          forSending[sequenceNumber].forEach(({ lookup }) => {
            const tx = `#${parsedConsilidatedTxns[lookup].sequenceNumber} - ${
              parsedConsilidatedTxns[lookup].ofiReferenceNumber
            } - PHP ${InwardFileGenerator.staticParseAmount(
              parsedConsilidatedTxns[lookup].amount
            )} - ${parsedConsilidatedTxns[lookup].status}`;

            if (stats.status == 200) {
              sentRackLogs.push(tx);
              parsedConsilidatedTxns[lookup].flowStatus = 3;

              totalSent += 1;
            } else failedRackLogs.push(tx);

            totalRequest += 1;
          });

          if (stats.status != 200) remarks = stats.body.message;

          txns = {
            sent: sentRackLogs,
            failed: failedRackLogs,
            remarks,
          };
          responseMessage = `${totalSent}/${totalRequest} transaction/s sent.`;
        });
      }

      await Drive.put(
        filepath,
        JSON.stringify(parsedConsilidatedTxns, null, 4)
      );

      await InwardFileGenerator.createInwardLog(
        settlementDate,
        type,
        user,
        txns
      );

      Socket.broadcastData("Inward", "transactionSave", {
        date: settlementDate,
        message: "Sync triggered.",
      });

      response = BaseService.noDataResponseSerializer(responseMessage, 200);
    } else
      response = BaseService.noDataResponseSerializer(
        "Failed to update status",
        400
      );

    return response;
  }

  static async regenerateFiles(date, user) {
    const inward = await Inward.query()
      .whereRaw("CAST(settlement_date as date) = ?", date)
      .orderByRaw("CAST(sequence_number as int) asc")
      .fetch();

    const messages = await Promise.all(
      inward.toJSON().map(async (batch) => {
        const msg = await Drive.get(
          `inward_message/${batch.sequence_number}.json`,
          "utf8"
        );
        const parsedMessage = {
          FIToFICstmrCdtTrf: JSON.parse(msg),
        };

        parsedMessage.sequenceNumber = batch.sequence_number;
        parsedMessage.numberOfTransactions = batch.number_of_transaction;

        return parsedMessage;
      })
    );

    let startingIndex = 0;

    for (let idx = 0; idx < messages.length; idx++) {
      await InwardFileGenerator.generateFiles(
        messages[idx],
        messages[idx].sequenceNumber,
        startingIndex
      );

      startingIndex += +messages[idx].numberOfTransactions;
    }

    const settlementDate = moment(date, "YYYY-MM-DD").format("YYYYMMDD");
    await InwardFileGenerator.createInwardLog(
      settlementDate,
      "regenerate",
      user
    );

    return BaseService.noDataResponseSerializer(
      "Successfully regenerated files",
      200
    );
  }

  static async getInwardConsolidatedLogs(date) {
    let response = {};
    const settlementDate = moment(date, "YYYY-MM-DD").format("YYYYMMDD");
    const filePath = `consolidated_inward/${settlementDate}/log.json`;
    const exists = await Drive.exists(filePath);

    if (exists) {
      const streamLogs = await Drive.get(filePath, "utf8");
      let parsedlogs = JSON.parse(streamLogs);
      let logs = parsedlogs.reverse().map((log) => {
        log.user.role = log.user.role.role;

        return log;
      });

      response = BaseService.withDataResponseSerializer(logs);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async checkForResync(date) {
    const inward = await Inward.query()
      .whereRaw("CAST(settlement_date as date) = ?", date)
      .where({
        total_amount: null,
        number_of_transaction: null,
      })
      .fetch();

    const forResync = inward.rows.length > 0 ? true : false;

    return BaseService.withDataResponseSerializer({ forResync });
  }

  static async reSyncInward(date, user) {
    const settlementDate = moment(date, "YYYY-MM-DD").format("YYYYMMDD");

    await Drive.put("inwardsyncing", "");
    Socket.broadcastData("Scheduler", "triggerSync", {
      type: "inward",
      message: "Sync triggered.",
    });

    await Drive.delete(`consolidated_inward/${settlementDate}/message.json`);
    await TransactionList.query()
      .whereRaw("CAST(settlement_date as date) = ?", date)
      .delete();
    const inward = await Inward.query()
      .whereRaw("CAST(settlement_date as date) = ?", date)
      .fetch();

    const inwardCollection = inward.rows;

    const inwardIndex = await Drive.get(
      Helpers.tmpPath("inward_index.json"),
      "utf8"
    );
    const parsedInwardIndex = JSON.parse(inwardIndex);
    parsedInwardIndex[settlementDate] = 0;
    await Drive.put(
      Helpers.tmpPath("inward_index.json"),
      JSON.stringify(parsedInwardIndex, null, 4)
    );

    await InwardFileGenerator.createInwardLog(date, "resync", user);

    try {
      for (let idx = 0; idx < inwardCollection.length; idx++) {
        await InwardFileGenerator.generateTransaction(
          inwardCollection[idx].sequence_number,
          inwardCollection[idx].settlement_date,
          "SYSTEM"
        );
      }
    } catch {}

    await Drive.delete("inwardsyncing");
    Socket.broadcastData("Scheduler", "triggerSync", {
      type: "inward",
      message: "Sync triggered.",
    });

    return BaseService.noDataResponseSerializer(
      "Successfully triggered re-sync",
      200
    );
  }

  static async generatePDFTable(request, user) {
    const { file, range, settlementDate } = request;
    let txns = file.map((fl) => `#${fl} | ${range[fl]}`);

    const date = moment(settlementDate, "YYYY-MM-DD").format("YYYYMMDD");
    const streamMessage = await Drive.get(
      `consolidated_inward/${date}/message.json`,
      "utf8"
    );

    const table = JSON.parse(streamMessage).filter((msg, idx) =>
      file.map((fl) => +fl).includes(msg.sequenceNumber)
    );

    const templatePath = "pdf_template/inward_consolidated.html";
    const filename = `${moment().format("x")}_inward.pdf`;
    const filePath = `pdf/report/${filename}`;

    let transBody = table.map((trans) => {
      const amt = `${trans.amount}`.replace(/,/g, "");

      const parsedAmount =
        +amt == 0
          ? "PROCESSING..."
          : (+amt).toLocaleString("en-US", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            });

      return {
        ...trans,
        parsedAmount,
      };
    });

    const data = {
      date: moment(date, "YYYYMMDD").format("MMMM D, YYYY"),
      txn: transBody,
    };

    const pdfInstance = new PDFGenerator(
      templatePath,
      data,
      filePath,
      "A4",
      "landscape"
    );
    await pdfInstance.generatePDF();

    const encryptedData = Encryption.encrypt(filename);
    const hash = Buffer.from(encryptedData).toString("base64");

    await InwardFileGenerator.createInwardLog(date, "generate_pdf", user, txns);

    return BaseService.withDataResponseSerializer(
      { link: `${hash}/Inward Messages` },
      null,
      `Successfully generated link.`
    );
  }
}

module.exports = InwardService;
