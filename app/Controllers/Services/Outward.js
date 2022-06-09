"use strict";
const BaseService = use("App/Controllers/Services/Base");
const APIService = use("App/Controllers/Services/Api");
const Drive = use("Drive");
const Helpers = use("Helpers");
const Outward = use("App/Models/Outward");
const OutwardParser = use("Library/Outward/Service");
const PDFGenerator = use("Library/PDFGenerator/Service");
const PesonetTransaction = use("App/Models/PesonetTransaction");
const moment = use("moment");
const Encryption = use("Encryption");
const randomstring = use("randomstring");


class OutwardService {
  static fields() {
    return [
      "reference_id",
      "sequence_number",
      "settlement_date",
      "total_amount",
      "number_of_transaction",
      "total_amount",
    ];
  }

  static async getOutwardBatch(request) {
    const { search, page, limit, filter, date } = request;
    let response = {};
    let query = Outward.query();

    if (`${filter}` && filter == 0) query.whereIn("status", [0, 1]);
    else if (`${filter}` && filter == 1) query.whereIn("status", [2, 3]);
    else if (`${filter}` && filter == 2) query.where("status", 4);
    else if (`${filter}` && filter == -2) query.where("status", filter);
    else if (`${filter}` && filter == 3 && date)
      query.whereRaw("CAST(created_at as date) = ? ", [date]);

    if (search && search.length > 0)
      query = BaseService.searchQuery(query, OutwardService.fields(), search);

    if (limit && !page) query.limit(limit);

    query.orderBy("created_at", "desc");

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

  static async getOutwardMessage(refId) {
    let response = {};
    let outward = await Outward.findBy("reference_id", refId);

    if (outward) {
      const parsedData = BaseService.camelCaseBody(outward.toJSON());
      response = BaseService.withDataResponseSerializer(parsedData);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async createOutwardMessage(request, username) {
    const parser = new OutwardParser(request);
    const {
      numberOfTransactions: number_of_transaction,
      totalAmount: total_amount,
    } = await parser.getDetails();

    const outward = new Outward();

    outward.merge({ number_of_transaction, total_amount });

    await outward.save();

    const transaction = new PesonetTransaction();

    transaction.merge({
      transaction_id: outward.id,
      user: username,
      type: "OUTWARD",
      remarks: "Created outward message.",
    });

    await transaction.save();

    await Drive.put(
      `${Helpers.tmpPath("outward_message")}/${
        outward.reference_id
      }-upload.json`,
      JSON.stringify(request, null, 4)
    );

    return BaseService.noDataResponseSerializer(
      "Successfully created outward message.",
      200
    );
  }

  static async getTransactionsRaw(refId) {
    let response = {};

    const outwardMessage = await Drive.get(
      Helpers.tmpPath(`outward_message/${refId}-upload.json`)
    );

    const { transactions } = JSON.parse(outwardMessage.toString());

    response = BaseService.withDataResponseSerializer(transactions);

    return response;
  }

  static async getTransactions(refId, user) {
    let response = {};
    const outward = await Outward.findBy("reference_id", refId);

    if ([0, 1, -2].includes(outward.status)) {
      const outwardMessage = await Drive.get(
        Helpers.tmpPath(`outward_message/${outward.reference_id}-upload.json`)
      );
      const parsedOutwardMessage = JSON.parse(outwardMessage.toString());
      response = BaseService.withDataResponseSerializer(parsedOutwardMessage);
    } else {
      const statusDesc = {
        ACCC: "Accepted and Settlement Completed",
        PART: "Partially Accepted",
        PNDG: "Pending",
        RCVD: "Received",
        RJCT: "Reject",
      };

      let transactionsFromApi = [];
      let statusFromApi = [];

      for (let index = 0; index < outward.number_of_batch; index++) {
        const seq = outward.sequence_number.split(", ");

        const txnData = await APIService.sendOutwardMessageStatusUpdate(
          seq[index],
          user
        );

        transactionsFromApi.push(...txnData.body.data.TxInfAndSts);
        statusFromApi.push(txnData.body.data.GrpHdr.OrgnlGrpInfAndSts.GrpSts);
      }

      const outwardExist = await Drive.exists(
        Helpers.tmpPath(`outward_message/${outward.reference_id}-batch-1.json`)
      );

      let transactions = [];

      if (outwardExist) {
        for (let index = 0; index < outward.number_of_batch; index++) {
          const outwardMessage = await Drive.get(
            Helpers.tmpPath(
              `outward_message/${outward.reference_id}-batch-${index + 1}.json`
            )
          );
          const { transactions: txns } = JSON.parse(outwardMessage.toString());
          transactions.push(...txns);
        }

        const parser = new OutwardParser(transactions);
        transactions = parser.populateTransactionFromApiToFile(
          transactionsFromApi
        );
      } else {
        const parser = new OutwardParser(transactionsFromApi);
        transactions = parser.populateTransactionFromApi();
      }

      const groupStatusDescription = statusFromApi.map((stats) => {
        return statusDesc[stats];
      });

      const outwardBody = {
        groupStatus: [...new Set(statusFromApi)].join(", "),
        groupStatusDescription: [...new Set(groupStatusDescription)].join(", "),
        transactions,
      };

      const OutwardService = new OutwardParser(outwardBody);
      await OutwardService.hasStatus(outward.id);

      response = BaseService.withDataResponseSerializer(outwardBody);
    }

    return response;
  }

  static async reject(request, username) {
    const { remarks, referenceId } = request;
    const outward = await Outward.findBy("reference_id", referenceId);

    outward.merge({ status: -2, remarks });
    await outward.save();

    const transaction = new PesonetTransaction();

    transaction.merge({
      transaction_id: outward.id,
      user: username,
      type: "OUTWARD",
      remarks: "Rejected outward message.",
    });

    await transaction.save();

    const parsedData = BaseService.camelCaseBody(outward.toJSON());

    return BaseService.withDataResponseSerializer(
      parsedData,
      null,
      "Outward message rejected."
    );
  }

  static async validateOutwardMessage(referenceId, user) {
    const outward = await Outward.findBy("reference_id", referenceId);
    const localExternalCodes = outward.local_external_code.split(",");

    const txns = await OutwardParser.checkLocalExternalCodes(
      localExternalCodes,
      user
    );

    if (txns.length > 0) {
      await OutwardParser.validateOutwardMessages(txns, outward.reference_id);
    }

    const transaction = new PesonetTransaction();

    outward.merge({remarks: 'validated'});
    await outward.save();

    transaction.merge({
      transaction_id: outward.id,
      user,
      type: "OUTWARD",
      remarks: "Validated outward message.",
    });

    await transaction.save();

    return BaseService.noDataResponseSerializer(
      "Successfully validated batch.",
      200
    );
  }

  static async sendOutwardMessage(request, user) {
    let response = {};
    const { referenceId, bicOfBank, transactions, forSubmission } = request;

    const outward = await Outward.findBy("reference_id", referenceId);

    outward.merge({
      processing: 1,
      is_sent: 1,
      remarks: 'processed'
    });

    await outward.save();

    const lecs = outward.local_external_code.split(",");

    let transForSending = transactions.filter((txn, idx) =>
      forSubmission.includes(idx)
    );
    console.log(transactions,forSubmission,"transactions")
    forSubmission.map((idx) => {
      transactions[idx].sent = true;
    });


    if (lecs.length > 0) {
      const txns = await OutwardParser.checkLocalExternalCodes(lecs, user);
      let searchRack = [];

      txns.forEach((txn) => {
        txn.body.data.TxInfAndSts.forEach((tx) => {
          searchRack.push(tx.OrgnlTxId);
        });
      });

      const sent = transForSending.filter((txFS) =>
        searchRack.includes(txFS.ofiReferenceNumber)
      );

      if (sent.length > 0) {
        await OutwardParser.validateOutwardMessages(txns, outward.reference_id);

        response = BaseService.noDataResponseSerializer(
          `Transaction/s are already sent. [${sent
            .map((s) => s.ofiReferenceNumber)
            .join(", ")}].`
        );

        outward.merge({
          processing: 0,
        });

        await outward.save();

        return response;
      }
    }

    const outwardMessage = {
      bicOfBank,
      transactions,
    };

    const detailsParser = new OutwardParser(outwardMessage);

    const {
      numberOfTransactions: number_of_transaction,
      totalAmount: total_amount,
    } = await detailsParser.getDetails();

    let transRack = [];
    let sentCount = transactions.filter((txn) => txn.sent).length;

    while (transForSending.length > 0) {
      transRack.push(transForSending.splice(0, 200));
    }

    let responses = [];
    const localExternalCodes = transRack.map(() => {
      const ts = `${moment().format("x")}`.substring(0, 16);
      const localExternalCode =
        ts.length < 16
          ? `${ts}${randomstring.generate({
              length: 16 - ts.length,
              charset: "numeric",
            })}`
          : ts;

      return localExternalCode;
    });

    outward.merge({
      local_external_code: `${
        outward.local_external_code.trim().length > 0
          ? `${outward.local_external_code},${localExternalCodes.join(",")}`
          : localExternalCodes.join(",")
      }`,
    });

    await outward.save();

    for (let index = 0; index < transRack.length; index++) {
      const outwardSend = await APIService.sendOutwardMessage(
        { bicOfBank, transactions: transRack[index] },
        user,
        localExternalCodes[index]
      );

      responses.push(outwardSend);
    }

    if (responses.find((rsp) => rsp.status == 200)) {
      let settlementDateRack = [];
      let sequenceNumberRack = [];
      let originalSequenceRack = outward.sequence_number
        ? outward.sequence_number.split(", ")
        : [];
      let originalSequenceCount = originalSequenceRack.length;
      let originalSettlementDateRack = outward.settlement_date
        ? outward.settlement_date.split(" - ")
        : [];

      for (let index = 0; index < responses.length; index++) {
        if (responses[index].status == 200) {
          sequenceNumberRack.push(
            responses[index].body.data.outward_message.seq
          );
          settlementDateRack.push(
            moment(responses[index].body.settlement_date, "YYYY/MM/DD").format(
              "MMMM D, YYYY"
            )
          );

          const parser = new OutwardParser({
            bicOfBank,
            transactions: transRack[index],
          });

          await parser.generateTransaction(
            responses[index].body.data.outward_message.seq,
            responses[index].body.settlement_date
          );

          await Drive.put(
            `${Helpers.tmpPath("outward_message")}/${
              outward.reference_id
            }-batch-${originalSequenceCount + index + 1}.json`,
            JSON.stringify(
              { bicOfBank, transactions: transRack[index] },
              null,
              4
            )
          );

          await Drive.put(
            `${Helpers.tmpPath("outward_message")}/${
              outward.reference_id
            }-upload.json`,
            JSON.stringify(outwardMessage, null, 4)
          );
        }
      }

      let forMerging = {
        number_of_batch: originalSequenceCount + transRack.length,
        sequence_number: [...originalSequenceRack, ...sequenceNumberRack].join(
          ", "
        ),
        settlement_date: [
          ...originalSettlementDateRack,
          ...settlementDateRack,
        ].join(" - "),
        status: sentCount == transactions.length ? 2 : 1,
      };

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

      const transaction = new PesonetTransaction();

      transaction.merge({
        transaction_id: outward.id,
        user,
        type: "OUTWARD",
        remarks: "Sent outward message.",
      });

      await transaction.save();

      const parsedData = BaseService.camelCaseBody(outward.toJSON());

      response = BaseService.withDataResponseSerializer(
        parsedData,
        null,
        `Successfully sent ${transRack.length}/${responses.length} outward batch/es.`
      );
    } else {
      const errs = responses.filter((rsp) => rsp.status != 200);

      const errMsg = [];

      errs.forEach((e) => {
        if (e.body && e.body.message) errMsg.push(e.body.message);
      });

      response = BaseService.noDataResponseSerializer(
        `Failed to send outward message. <br /> * ${errMsg.join("<br> * ")}`
      );
    }

    outward.merge({
      processing: 0,
    });

    await outward.save();

    return response;
  }

  static getBIC(bankList, brstn) {
    const bank = bankList.PESONetMemberBanks.filter(
      (data) => data.pchc.head_office_brstn == brstn
    );

    return bank.length > 0 ? bank[0].BICFI : null;
  }

  static async saveOutwardMessage(request, username) {
    let response = {};
    const { referenceId, bicOfBank, transactions } = request;

    let sentCount = transactions.filter((txn) => txn.sent).length;

    const outwardMessage = {
      bicOfBank,
      transactions,
    };

    const detailsParser = new OutwardParser(outwardMessage);

    const {
      numberOfTransactions: number_of_transaction,
      totalAmount: total_amount,
    } = await detailsParser.getDetails();

    const outward = await Outward.findBy("reference_id", referenceId);

    let forMerging = {};

    if (total_amount != outward.total_amount) {
      forMerging = {
        ...forMerging,
        number_of_transaction,
        total_amount,
      };
    }

    if (sentCount == transactions.length) {
      forMerging = {
        ...forMerging,
        status: 2,
      };
    }

    if (Object.keys(forMerging).length > 0) {
      outward.merge(forMerging);

      await outward.save();
    }

    const transaction = new PesonetTransaction();

    transaction.merge({
      transaction_id: outward.id,
      user: username,
      type: "OUTWARD",
      remarks: "Save outward message.",
    });

    await transaction.save();

    await Drive.put(
      `${Helpers.tmpPath("outward_message")}/${
        outward.reference_id
      }-upload.json`,
      JSON.stringify(outwardMessage, null, 4)
    );

    return BaseService.noDataResponseSerializer(
      "Successfully saved outward message.",
      200
    );
  }

  static async uploadOutward(outward, username) {
    const outwardStream = await Drive.get(outward.tmpPath);
    const outwardData = outwardStream.toString();

    const bankList = (
      await Drive.get(Helpers.tmpPath("bank_list/list.json"))
    ).toString();

    const bic = (await Drive.get(Helpers.tmpPath("bank.txt"))).toString();

    const parser = new OutwardParser(outwardData);
    const txn = parser.generate();

    const transactions = txn.map((data) => {
      const tnxs = {
        ofiReferenceNumber: data.ofiReferenceNumber,
        amount: data.amount,
        remitterName: data.remitterName,
        remitterAddress: data.remitterAddress,
        remitterAccountNumber: data.remitterAccountNumber,
        remitterBIC: bic,
        beneficiaryName: data.beneficiaryName,
        beneficiaryAddress: data.beneficiaryAddress,
        beneficiaryAccountNumber: data.beneficiaryAccountNumber,
        beneficiaryBIC:
          OutwardService.getBIC(JSON.parse(bankList), data.receivingBank) || "",
        rfiReferenceNumber: data.rfiCustomerReferenceNumber,
        ofiCustomerReferenceNumber: data.ofiCustomerReferenceNumber,
        rfiCustomerReferenceNumber: data.rfiCustomerReferenceNumber,
        instructions: data.instructions,
      };

      const detailsParser = new OutwardParser(tnxs);
      return detailsParser.sanitizeSpecialCharacters();
    });

    const outwardMessage = {
      bicOfBank: bic,
      transactions,
    };

    const detailsParser = new OutwardParser(outwardMessage);

    const {
      numberOfTransactions: number_of_transaction,
      totalAmount: total_amount,
    } = await detailsParser.getDetails();

    const outwardModel = new Outward();

    outwardModel.merge({
      number_of_transaction,
      total_amount

    });

    await outwardModel.save();

    const transaction = new PesonetTransaction();

    transaction.merge({
      transaction_id: outwardModel.id,
      user: username,
      type: "OUTWARD",
      remarks: "Upload outward message.",
    });

    await transaction.save();

    await Drive.put(
      `${Helpers.tmpPath("outward_message")}/${
        outwardModel.reference_id
      }-upload.json`,
      JSON.stringify(outwardMessage, null, 4)
    );

    return BaseService.noDataResponseSerializer(
      "Successfully uploaded outward message.",
      200
    );
  }

  static async generatePDF(ref, user) {
    const outward = await Outward.findBy("reference_id", ref);
    const templatePath = "pdf_template/outward.html";
    const filePath = `pdf/outward/${outward.reference_id}.pdf`;

    const { body } = await OutwardService.getTransactions(
      outward.reference_id,
      user
    );

    let outwardParsed = BaseService.camelCaseBody(outward.toJSON());
    outwardParsed.totalAmount =
      +outwardParsed.totalAmount == 0
        ? "PROCESSING..."
        : (+outwardParsed.totalAmount).toLocaleString("en-US", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });

    let txn = [0, -2].includes(outward.status)
      ? { transactions: body.data.transactions }
      : {
          transactions: body.data.transactions,
          groupStatusDescription: body.data.groupStatusDescription,
          groupStatus: body.data.groupStatusDescription,
        };

    txn.transactions.forEach((txn, idx) => {
      const amt = `${txn.amount}`.replace(/,/g, "");

      const parsedAmount =
        +amt == 0
          ? "PROCESSING..."
          : (+amt).toLocaleString("en-US", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            });

      txn.amount = parsedAmount;
    });

    const data = {
      hasDetails: [0, -2].includes(outward.status) ? false : true,
      ref: outwardParsed,
      txn,
    };

    const pdfInstance = new PDFGenerator(templatePath, data, filePath);
    await pdfInstance.generatePDF();

    const encryptedData = Encryption.encrypt(outward.reference_id);
    const hash = Buffer.from(encryptedData).toString("base64");

    return BaseService.withDataResponseSerializer(
      { link: `${hash}/Outward Message` },
      null,
      `Successfully generated link.`
    );
  }

  static async checkOutwardProcessing(ref) {
    const outward = await Outward.findBy("reference_id", ref);

    if (outward) {
      if (outward.processing == 1)
        return BaseService.noDataResponseSerializer(
          "Outward batch is currently processing and is disabled from all actions. Would you like to enable processing?",
          200
        );
      else
        return BaseService.noDataResponseSerializer(
          "Outward batch is not being processed.",
          400
        );
    } else
      return BaseService.noDataResponseSerializer(
        "Reference ID does not exist.",
        400
      );
  }

  static async enableOutwardProcessing(ref) {
    const outward = await Outward.findBy("reference_id", ref);

    outward.merge({ processing: 0 });

    await outward.save();

    return BaseService.noDataResponseSerializer(
      `Outward batch (${ref}) can now be processed.`,
      200
    );
  }
}

module.exports = OutwardService;
