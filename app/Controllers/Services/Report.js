"use strict";
const BaseService = use("App/Controllers/Services/Base");
const TransactionList = use("App/Models/TransactionList");
const xlsx = use("xlsx");
const moment = use("moment");
const PDFGenerator = use("Library/PDFGenerator/Service");
const Encryption = use("Encryption");
const ReportLibService = use("Library/Report/Service");
const Drive = use("Drive");
const Helpers = use("Helpers");

class ReportService {
  static async generateOutwardTransactionReport(date) {
    let response = {};
    const data = await TransactionList.query()
      .where("type", "OUTWARD")
      .whereRaw("CAST(settlement_date as date) = ?", [date])
      .fetch();

    if (data.rows.length > 0) {
      const transactions = data.toJSON();
      const transRack = ReportLibService.setTransactionRack(
        transactions,
        "OUTWARD"
      );

      const txns = await ReportLibService.generateOutwardTransactions(
        transRack
      );

      response = BaseService.withDataResponseSerializer(txns);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async generateInwardTransactionReport(date) {
    let response = {};

    const txns = await ReportLibService.generateInwardTransactions(date);

    if (txns.length > 0)
      response = BaseService.withDataResponseSerializer(txns);
    else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async generateTransactionXLSX(request) {
    const { transactions, type } = request;

    const settlementDate = moment(
      transactions[0].settlementDate,
      "MMMM D, YYYY"
    ).format("YYYY-MM-DD");

    const sheetType = type.charAt(0).toUpperCase() + type.slice(1);
    let wb = xlsx.utils.book_new();
    const sheetName = `${sheetType} Report (${settlementDate})`;
    wb.SheetNames.push(sheetName);

    const header = [
      "Sequence Number",
      "Settlement Date",
      "Payment ID",
      "Amount",
      "OFI Reference Number",
      "OFI Customer Reference Number",
      "RFI Reference Number",
      "RFI Customer Reference Number",
      "Instructions",
      "Debtor/Remitter Name",
      "Debtor/Remitter Address",
      "Debtor/Remitter Account Number",
      "BIC of Debtor/Remitter",
      "Creditor/Beneficiary Name",
      "Creditor/Beneficiary Address",
      "Creditor/Beneficiary Account Number",
      "BIC of Creditor/Beneficiary",
      "Status",
    ];

    let totalAmount = 0;

    const content = transactions.map((trans) => {
      let status = "";

      if (type == "outward")
        status =
          trans.status && trans.status != "PROCESSING..."
            ? trans.status
            : "RECEIVED BY RFI";
      else status = trans.flowStatus == 3 ? trans.status : "";

      const amt = `${trans.amount}`.replace(/,/g, "");

      const parsedAmount = ReportLibService.parseAmount(amt);
      totalAmount += +amt || 0;

      return [
        trans.sequenceNumber,
        trans.settlementDate,
        trans.endToEndId || "",
        parsedAmount,
        trans.ofiReferenceNumber,
        trans.ofiCustomerReferenceNumber,
        trans.rfiReferenceNumber,
        trans.rfiCustomerReferenceNumber,
        trans.instructions,
        trans.remitterName,
        trans.remitterAddress,
        trans.remitterAccountNumber,
        trans.remitterBIC,
        trans.beneficiaryName,
        trans.beneficiaryAddress,
        trans.beneficiaryAccountNumber,
        trans.beneficiaryBIC,
        status,
      ];
    });

    const foot = [
      [],
      ["Total Amount:", ReportLibService.parseAmount(totalAmount)],
      ["Total Count:", transactions.length],
    ];

    const body = [header, ...content, ...foot];

    let ws = xlsx.utils.aoa_to_sheet(body);
    const wscols = [
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 20 },
      { wch: 30 },
      { wch: 150 },
      { wch: 55 },
      { wch: 150 },
      { wch: 30 },
      { wch: 20 },
      { wch: 55 },
      { wch: 150 },
      { wch: 35 },
      { wch: 25 },
      { wch: 20 },
    ];

    ws["!cols"] = wscols;

    wb.Sheets[sheetName] = ws;
    const out = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    return out;
  }

  static async generateTransactionPDF(request) {
    const { transactions, type } = request;
    const templatePath = "pdf_template/report_transaction.html";
    const filename = `${moment().format("x")}_${type}.pdf`;
    const filePath = `pdf/report/${filename}`;

    let totalAmount = 0;

    let transBody = transactions.map((trans) => {
      let statusMessage = "";
      const amt = `${trans.amount}`.replace(/,/g, "");

      totalAmount += +amt || 0;

      const parsedAmount =
        +amt == 0
          ? "PROCESSING..."
          : (+amt).toLocaleString("en-US", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            });

      if (type == "outward")
        statusMessage =
          trans.status && trans.status != "PROCESSING..."
            ? trans.status
            : "RECEIVED BY RFI";
      else statusMessage = trans.flowStatus == 3 ? trans.status : "";

      return {
        ...trans,
        statusMessage,
        parsedAmount,
      };
    });

    const data = {
      type: type.toUpperCase(),
      date: transactions[0].settlementDate,
      txn: transBody,
      count: transactions.length,
      totalAmount: ReportLibService.parseAmount(totalAmount),
    };

    const pdfInstance = new PDFGenerator(templatePath, data, filePath);
    await pdfInstance.generatePDF();

    const encryptedData = Encryption.encrypt(filename);
    const hash = Buffer.from(encryptedData).toString("base64");
    const upperCaseType = type.charAt(0).toUpperCase() + type.slice(1);

    return BaseService.withDataResponseSerializer(
      { link: `${hash}/${upperCaseType} Transaction Report` },
      null,
      `Successfully generated link.`
    );
  }

  static async generateTransactionPDFTable(request) {
    const { transactions, type } = request;
    const templatePath = "pdf_template/report_transaction_table.html";
    const filename = `${moment().format("x")}_${type}.pdf`;
    const filePath = `pdf/report/${filename}`;

    let totalAmount = 0;

    let transBody = transactions.map((trans) => {
      let statusMessage = "";
      const amt = `${trans.amount}`.replace(/,/g, "");

      totalAmount += +amt || 0;

      const parsedAmount =
        +amt == 0
          ? "PROCESSING..."
          : (+amt).toLocaleString("en-US", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            });

      if (type == "outward")
        statusMessage =
          trans.status && trans.status != "PROCESSING..."
            ? trans.status
            : "RECEIVED BY RFI";
      else statusMessage = trans.sent ? trans.status : "";

      return {
        ...trans,
        statusMessage,
        parsedAmount,
      };
    });

    const data = {
      type: type.toUpperCase(),
      isOutward: type == "outward" ? true : false,
      date: transactions[0].settlementDate,
      txn: transBody,
      bankLabel: type == "outward" ? "RECEIVING BANK" : "SENDING BANK",
      count: transactions.length,
      totalAmount: ReportLibService.parseAmount(totalAmount),
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
    const upperCaseType = type.charAt(0).toUpperCase() + type.slice(1);

    return BaseService.withDataResponseSerializer(
      { link: `${hash}/${upperCaseType} Transaction Report` },
      null,
      `Successfully generated link.`
    );
  }

  static async generatePesonetReport(date) {
    let response = {};
    const data = await TransactionList.query()
      .whereRaw("CAST(settlement_date as date) = ?", [date])
      .fetch();

    if (data.rows.length > 0) {
      const transactions = data.toJSON();

      const outwardTransRack = ReportLibService.setTransactionRack(
        transactions,
        "OUTWARD"
      );

      const outwardTransactions = await ReportLibService.generateOutwardTransactions(
        outwardTransRack
      );
      const inwardTransactions = await ReportLibService.generateInwardTransactions(
        moment(date, "YYYY-MM-DD").format("YYYYMMDD")
      );

      let outwardAmountRack = {};
      let inwardAmountRack = {};

      outwardTransactions.forEach((txn) => {
        outwardAmountRack[txn.beneficiaryBIC] = outwardAmountRack[
          txn.beneficiaryBIC
        ]
          ? [
              ...outwardAmountRack[txn.beneficiaryBIC],
              +txn.amount.replace(/,/g, ""),
            ]
          : [+txn.amount.replace(/,/g, "")];
      });

      inwardTransactions.forEach((txn) => {
        inwardAmountRack[txn.remitterBIC] = inwardAmountRack[txn.remitterBIC]
          ? [
              ...inwardAmountRack[txn.remitterBIC],
              +txn.amount.replace(/,/g, ""),
            ]
          : [+txn.amount.replace(/,/g, "")];
      });

      const outwardAmountKeyRack = Object.keys(outwardAmountRack);
      const inwardAmountKeyRack = Object.keys(inwardAmountRack);
      const list = await Drive.get(
        Helpers.tmpPath("bank_list/list.json"),
        "utf8"
      );
      const { PESONetMemberBanks: banks } = JSON.parse(list);
      const table = {};

      outwardAmountKeyRack.forEach((key) => {
        const amount = outwardAmountRack[key].reduce((a, b) => +a + +b, 0);
        const count = outwardAmountRack[key].length;

        table[key] = {
          outwardCount: count,
          loss: amount,
          bic: key,
        };
      });

      inwardAmountKeyRack.forEach((key) => {
        const amount = inwardAmountRack[key].reduce((a, b) => +a + +b, 0);
        const count = inwardAmountRack[key].length;

        table[key] = table[key]
          ? {
              ...table[key],
              inwardCount: count,
              win: amount,
            }
          : {
              inwardCount: count,
              win: amount,
              bic: key,
            };
      });

      const responseTable = Object.values(table).map((tbl) => {
        const bank = banks.find((bank) => bank.BICFI == tbl.bic);

        return {
          ...tbl,
          bankName: bank.bank_name,
        };
      });

      response = BaseService.withDataResponseSerializer(responseTable);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async generatePesonetReportPDF(request) {
    const { transactions, date } = request;
    const templatePath = "pdf_template/pesonet_report.html";
    const filename = `${moment().format("x")}_daily_consolidated_report.pdf`;
    const filePath = `pdf/report/${filename}`;

    let outwardTotal = 0;
    let lossTotal = 0;
    let inwardTotal = 0;
    let winTotal = 0;

    let transBody = transactions.map((trans) => {
      let { bankName, outwardCount, loss, inwardCount, win } = trans;

      outwardTotal += +outwardCount || 0;
      inwardTotal += +inwardCount || 0;
      lossTotal += +loss || 0;
      winTotal += +win || 0;

      return {
        bankName,
        outwardCount: outwardCount || "",
        loss: loss ? `${ReportLibService.parseAmount(loss)}-` : "",
        inwardCount: inwardCount || "",
        win: win ? `${ReportLibService.parseAmount(win)}-` : "",
      };
    });

    let netWin = 0;
    let netLoss = 0;
    const rawWin = `${winTotal}`.replace(/,/g, "");
    const rawLoss = `${lossTotal}`.replace(/,/g, "");

    if (+rawWin > +rawLoss) netWin = +rawWin - +rawLoss;

    if (+rawLoss > +rawWin) netLoss = +rawLoss - +rawWin;

    const data = {
      date,
      txn: transBody,
      outwardTotal,
      inwardTotal,
      lossTotal: `${ReportLibService.parseAmount(lossTotal)}-`,
      winTotal: `${ReportLibService.parseAmount(winTotal)}+`,
      netWin: `${ReportLibService.parseAmount(netWin)}+`,
      netLoss: `${ReportLibService.parseAmount(netLoss)}-`,
    };

    const pdfInstance = new PDFGenerator(templatePath, data, filePath);
    await pdfInstance.generatePDF();

    const encryptedData = Encryption.encrypt(filename);
    const hash = Buffer.from(encryptedData).toString("base64");

    return BaseService.withDataResponseSerializer(
      { link: `${hash}/Daily Consolidated Report` },
      null,
      `Successfully generated link.`
    );
  }
}

module.exports = ReportService;
