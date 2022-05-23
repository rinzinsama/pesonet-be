"use strict";
const BaseService = use("App/Controllers/Services/Base");
const Drive = use("Drive");
const Helpers = use("Helpers");
const fs = use("fs");
const fsExtra = use("fs-extra");
const exec = Helpers.promisify(use("child_process").exec);
const { to } = use("await-to-js");
const Socket = use("Socket");
const API = use("Library/API/Service");
const moment = use("moment");
use("moment-business-days");
const ApiTransaction = use("App/Models/ApiTransaction");
const Logger = use("Logger");
const { v4: uuidv4 } = use("uuid");

class ApiService {
  static fields() {
    return ["reference_id", "sent_by", "endpoint"];
  }

  static async generateTransaction(txn) {
    const { sentBy: sent_by, request, response, endpoint } = txn;

    const apiTransaction = new ApiTransaction();
    apiTransaction.merge({
      sent_by,
      endpoint,
      log: response.body.message,
    });

    await apiTransaction.save();

    Logger.transport("pesonet_api").info({
      timestamp: moment().format("MMMM D, YYYY - h:mm:ss A"),
      referenceId: apiTransaction.reference_id,
      endpoint,
      request: request,
      response: response.body,
    });
  }

  static generateInwardHeader(bicOfBank, originalMessageId) {
    return {
      GrpHdr: {
        MsgId: null,
        CreDtTm: +moment().format("x"),
        InstgAgt: {
          FinInstnId: {
            BICFI: bicOfBank,
          },
        },
        InstdAgt: {
          FinInstnId: {
            BICFI: "PCHCPHM1XXX",
          },
        },
      },
      OrgnlGrpInfAndSts: {
        OrgnlMsgId: +originalMessageId,
        OrgnlMsgNmId: "pacs.008",
      },
    };
  }

  static generateInwardTransaction(transactions, originalMessageId) {
    let txns = [];

    transactions.forEach((transaction) => {
      txns.push({
        OrgnlGrpInf: {
          OrgnlMsgId: +originalMessageId,
          OrgnlMsgNmId: "pacs.008",
        },
        OrgnlEndToEndId: +transaction.endToEndId,
        TxSts: transaction.transactionStatus,
        StsRsnInf: {
          AddtlInf: transaction.remarks,
        },
        AccptncDtTm: +moment().format("x"),
        OrgnlTxRef: {
          Amt: {
            EqvtAmt: {
              Amt: +transaction.creditedAmount,
              CcyOfTrf: "PHP",
            },
          },
          Cdtr: {
            Nm: transaction.beneficiaryName.substring(0, 50),
          },
          CdtrAcct: {
            Id: {
              Othr: {
                Id: transaction.beneficiaryAccountNumber,
              },
            },
          },
          CdtrAgt: {
            FinInstnId: {
              BICFI: transaction.beneficiaryBIC,
            },
          },
        },
      });
    });

    return {
      TxInfAndSts: txns,
    };
  }

  static generateOutwardHeader(
    totalAmount,
    numberOfTransactions,
    bicOfBank,
    localExternalCode
  ) {
    return {
      GrpHdr: {
        MsgId: null,
        CreDtTm: null,
        NbOfTxs: numberOfTransactions,
        TtlIntrBkSttlmAmt: {
          Ccy: "PHP",
          value: totalAmount,
        },
        IntrBkSttlmDt: null,
        SttlmInf: {
          SttlmMtd: "CLRG",
        },
        InstgAgt: {
          FinInstnId: {
            BICFI: bicOfBank,
          },
        },
        InstdAgt: {
          FinInstnId: {
            BICFI: "PCHCPHM1XXX",
          },
        },
        PmtTpInf: {
          LclInstrm: {
            Prtry: localExternalCode,
          },
        },
      },
    };
  }

  static generateOutwardTransaction(transactions) {
    let txns = [];
    let totalAmount = 0;
    const totalTransactions = transactions.length;

    transactions.forEach((transaction) => {
      const uuid = uuidv4();
      totalAmount += +transaction.amount.replace(/,/g, "");

      txns.push({
        PmtId: {
          EndToEndId: null,
          TxId: transaction.ofiReferenceNumber,
          UETR: uuid.replace(/-/g, ""),
        },
        PmtTpInf: {
          SvcLvl: {
            Prtry: "NURG",
          },
          CtgyPurp: {
            Cd: "CASH",
          },
        },
        IntrBkSttlmAmt: {
          Ccy: "PHP",
          value: transaction.amount.replace(/,/g, ""),
        },
        ChrgBr: "SLEV",
        Dbtr: {
          Nm: transaction.remitterName,
          PstlAdr: transaction.remitterAddress
            .split(/(.{50})/)
            .filter((o) => o)
            .slice(0, 4),
        },
        DbtrAcct: {
          Id: {
            Othr: {
              Id: transaction.remitterAccountNumber,
            },
          },
        },
        DbtrAgt: {
          FinInstnId: {
            BICFI: transaction.remitterBIC,
          },
        },
        Cdtr: {
          Nm: transaction.beneficiaryName,
          PstlAdr: transaction.beneficiaryAddress
            ? transaction.beneficiaryAddress
                .split(/(.{50})/)
                .filter((o) => o)
                .slice(0, 4)
            : [],
        },
        CdtrAcct: {
          Id: {
            Othr: {
              Id: transaction.beneficiaryAccountNumber,
            },
          },
        },
        CdtrAgt: {
          FinInstnId: {
            BICFI: transaction.beneficiaryBIC, //'BOTKPHMMXXX' - transaction.beneficiaryBIC,
          },
        },
        RmtInf: {
          Ustrd: {
            rfi_reference_number: transaction.rfiReferenceNumber || null,
            ofi_customer_reference_number:
              transaction.ofiCustomerReferenceNumber || null,
            rfi_customer_reference_number:
              transaction.rfiCustomerReferenceNumber || null,
            instructions: transaction.instructions,
          },
        },
      });
    });

    totalAmount = (+totalAmount).toFixed(2);

    return {
      transactions: { CdtTrfTxInf: txns },
      totalAmount: +totalAmount,
      totalTransactions,
    };
  }

  static async getApiSettings() {
    const credentials = await Drive.get(
      Helpers.tmpPath("api/credentials.json")
    );
    const parsedCredentials = JSON.parse(credentials.toString());
    const files = fs.readdirSync(Helpers.tmpPath("api/certificate"));

    return BaseService.withDataResponseSerializer({
      ...parsedCredentials,
      files,
    });
  }

  static async uploadCreds(certificate) {
    let response = {};

    const ext = certificate.extname.toLowerCase();

    await certificate.move(Helpers.tmpPath("api"), {
      name: `pesonet.${ext}`,
      overwrite: true,
    });

    if (!certificate.moved()) {
      response = BaseService.noDataResponseSerializer(
        "Failed to upload certificate.",
        500
      );
    } else
      response = BaseService.noDataResponseSerializer(
        "Successfully uploaded certificate.",
        200
      );

    return response;
  }

  static async updateAPISettings(request) {
    let response = {};
    const { url, path, passphrase, apiKey, secretKey, hasUpload } = request;

    const data = {
      url,
      path,
      passphrase,
      apiKey,
      secretKey,
    };

    const apiPath = Helpers.tmpPath("api");

    if (hasUpload) {
      const pemExists = await Drive.exists(`${apiPath}/pesonet.pem`);

      if (pemExists) {
        const [errKey, dataKey] = await to(
          exec(
            `openssl pkey -in ${apiPath}/pesonet.pem -out ${apiPath}/pesonet.key`
          )
        );

        const [errCrt, dataCrt] = await to(
          exec(
            `openssl crl2pkcs7 -nocrl -certfile ${apiPath}/pesonet.pem | openssl pkcs7 -print_certs -out ${apiPath}/pesonet.crt`
          )
        );

        if (errKey || errCrt) {
          await Drive.delete(`${apiPath}/pesonet.pem`);

          response = BaseService.noDataResponseSerializer(
            "Failed to update api settings.",
            500
          );
        } else {
          await Drive.put(
            `${apiPath}/credentials.json`,
            JSON.stringify(data, null, 4)
          );

          await fsExtra.emptyDir(`${apiPath}/certificate`);

          await Drive.move(
            `${apiPath}/pesonet.pem`,
            `${apiPath}/certificate/pesonet.pem`
          );
          await Drive.move(
            `${apiPath}/pesonet.crt`,
            `${apiPath}/certificate/pesonet.crt`
          );
          await Drive.move(
            `${apiPath}/pesonet.key`,
            `${apiPath}/certificate/pesonet.key`
          );

          Socket.broadcastData("API", "update", {
            message: "New Entry",
          });

          response = BaseService.noDataResponseSerializer(
            "Successfully updated api settings.",
            200
          );
        }
      } else {
        await Drive.put(
          `${apiPath}/credentials.json`,
          JSON.stringify(data, null, 4)
        );

        await fsExtra.emptyDir(`${apiPath}/certificate`);

        await Drive.move(
          `${apiPath}/pesonet.p12`,
          `${apiPath}/certificate/pesonet.p12`
        );

        Socket.broadcastData("API", "update", {
          message: "New Entry",
        });

        response = BaseService.noDataResponseSerializer(
          "Successfully updated api settings.",
          200
        );
      }
    } else {
      await Drive.put(
        `${apiPath}/credentials.json`,
        JSON.stringify(data, null, 4)
      );

      Socket.broadcastData("API", "update", {
        message: "New Entry",
      });

      response = BaseService.noDataResponseSerializer(
        "Successfully updated api settings.",
        200
      );
    }

    return response;
  }

  static async sendHeartbeat(sentBy = "SYSTEM") {
    let response = {};

    const apiInstance = new API(sentBy, "heartbeat");
    const { responseStatus, status, message, data } = await apiInstance.send();

    if (data)
      response = BaseService.withDataResponseSerializer(
        data,
        { responseStatus },
        message,
        status
      );
    else response = BaseService.noDataResponseSerializer(message, status);

    return response;
  }

  static async sendBankList(sentBy = "SYSTEM") {
    let response = {};

    const apiInstance = new API(sentBy, "banks");
    const { responseStatus, status, message, data } = await apiInstance.send();

    if (data)
      response = BaseService.withDataResponseSerializer(
        data,
        { responseStatus },
        message,
        status
      );
    else response = BaseService.noDataResponseSerializer(message, status);

    return response;
  }

  static async sendIndex(request, sentBy = "SYSTEM") {
    let response = {};

    const { cycle, settlementDate } = request;
    const [year, month, date] = settlementDate.split("-");

    const apiInstance = new API(
      sentBy,
      `index/${year}/${month}/${date}/${cycle}`
    );

    const { responseStatus, status, message, data } = await apiInstance.send();

    if (data) {
      response = BaseService.withDataResponseSerializer(
        data,
        { responseStatus },
        message,
        status
      );
    } else response = BaseService.noDataResponseSerializer(message, status);

    return response;
  }

  static async sendInwardBatch(sequenceNumber, sentBy = "SYSTEM") {
    let response = {};

    const apiInstance = new API(sentBy, `inward_batch/${sequenceNumber}`);

    const { responseStatus, status, message, data } = await apiInstance.send();

    if (data)
      response = BaseService.withDataResponseSerializer(
        data,
        { responseStatus },
        message,
        status
      );
    else response = BaseService.noDataResponseSerializer(message, status);

    return response;
  }

  static async sendOutwardMessage(
    request,
    sentBy = "SYSTEM",
    localExternalCode
  ) {
    let response = {};
    const { bicOfBank, transactions } = request;

    const {
      transactions: txns,
      totalAmount,
      totalTransactions,
    } = ApiService.generateOutwardTransaction(transactions);
    const groupHeader = ApiService.generateOutwardHeader(
      totalAmount,
      totalTransactions,
      bicOfBank,
      localExternalCode
    );

    const body = { FIToFICstmrCdtTrf: { ...groupHeader, ...txns } };

    const apiInstance = new API(
      sentBy,
      "outward_message/create",
      totalAmount,
      "post"
    );
    const { responseStatus, status, message, data } = await apiInstance.send(
      body
    );

    if (responseStatus == 200) {
      let found = 0;
      let dateIndex = 0;
      let settlement_date = "";
      do {
        const { status, body } = await ApiService.sendIndex({
          cycle: 1,
          settlementDate: moment(data.outward_message.received_date, "x")
            .add(dateIndex, "day")
            .format("YYYY-MM-DD"),
        });

        if (
          status == 200 &&
          body.data.index.outward_batches.includes(+data.outward_message.seq)
        ) {
          settlement_date = moment(data.outward_message.received_date, "x")
            .add(dateIndex, "day")
            .format("YYYY/MM/DD");
          found = 1;
        }

        dateIndex++;
      } while (found == 0);

      response = BaseService.withDataResponseSerializer(
        data,
        { responseStatus, settlement_date },
        message,
        status
      );
    } else
      response = BaseService.withDataResponseSerializer(
        data,
        { responseStatus },
        data.error.message,
        status
      );

    return response;
  }

  static async sendOutwardMessageStatusUpdate(
    sequenceNumber,
    sentBy = "SYSTEM"
  ) {
    let response = {};

    const apiInstance = new API(sentBy, `outward_message/${sequenceNumber}`);

    const { responseStatus, status, message, data } = await apiInstance.send();

    if (data)
      response = BaseService.withDataResponseSerializer(
        data,
        { responseStatus },
        message,
        status
      );
    else response = BaseService.noDataResponseSerializer(message, status);

    return response;
  }

  static async sendOutwardMessageSearch(localExternalCode, sentBy = "SYSTEM") {
    let response = {};

    const apiInstance = new API(sentBy, "outward_message/search", null, "post");

    const { responseStatus, status, message, data } = await apiInstance.send({
      local_external_code: localExternalCode,
    });

    if (data)
      response = BaseService.withDataResponseSerializer(
        data,
        { responseStatus },
        message,
        status
      );
    else response = BaseService.noDataResponseSerializer(message, status);

    return response;
  }

  static async sendInwardBatchStatusUpdate(request, sentBy = "SYSTEM") {
    let response = {};

    const { bicOfBank, originalMessageId, transactions } = request;

    const groupHeader = ApiService.generateInwardHeader(
      bicOfBank,
      originalMessageId
    );
    const txns = ApiService.generateInwardTransaction(
      transactions,
      originalMessageId
    );

    const body = { ...groupHeader, ...txns };

    const apiInstance = new API(
      sentBy,
      `inward_batch/update`,
      originalMessageId,
      "post"
    );

    const { responseStatus, status, message, data } = await apiInstance.send(
      body
    );

    if (data)
      response = BaseService.withDataResponseSerializer(
        data,
        { responseStatus },
        message,
        status
      );
    else response = BaseService.noDataResponseSerializer(message, status);

    return response;
  }

  static async getLogs(request) {
    const { search, page, limit } = request;
    let response = {};
    let query = ApiTransaction.query().orderBy("id", "desc");

    if (search && search.length > 0)
      query = BaseService.searchQuery(query, ApiService.fields(), search);

    if (limit && !page) query.limit(limit);

    const { data, ...obj } = await BaseService.getData(query, page, limit);

    if (data.length == 0) response = BaseService.noDataResponseSerializer();
    else {
      const parsedData = BaseService.camelCaseBody(data);
      response = BaseService.withDataResponseSerializer(parsedData, obj);
    }

    return response;
  }
}

module.exports = ApiService;
