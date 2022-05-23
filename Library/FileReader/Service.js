"use strict";
const Drive = use("Drive");
const Helpers = use("Helpers");
const FileGenerator = use("Library/FileGenerator/Factory");
const FileReaderTransaction = use("App/Models/FileReaderTransaction");
const archiver = use("Library/Archiver/Service");
const fsExtra = use("fs-extra");
const Parser = use("Library/FileReader/Parser");
const Validation = use("Library/FileReader/Validation");

class Service {
  constructor(path) {
    const pathRack = path.split("\\");
    this.path = path;
    this.filename = pathRack.pop();
    this.rootPath = pathRack.join("/");
  }

  async check() {
    const regex = new RegExp("pddtsFile\\d{8}.txt", "gi");
    return regex.test(this.filename) ? true : false;
  }

  async createTransaction(filename, remarks, status) {
    const transaction = new FileReaderTransaction();
    transaction.merge({
      filename,
      remarks,
      status,
    });

    await transaction.save();

    return transaction.toJSON();
  }

  async process() {
    const check = await this.check();

    if (check) await this.processFile();
    else await this.markInvalid();
  }

  async setStatus(stat, txn) {
    await Drive.delete(this.path);
    await fsExtra.emptyDir(this.rootPath);
    await Drive.put(
      `${this.rootPath}/${stat}`,
      JSON.stringify(
        {
          reference_id: txn.reference_id,
          timestamp: txn.created_at,
          status: stat,
        },
        null,
        4
      )
    );
  }

  async markInvalid() {
    const txn = await this.createTransaction(
      this.filename,
      "File name format is invalid.",
      "-1"
    );

    await this.setStatus("INVALID", txn);
  }

  async markCannotOpen() {
    const txn = await this.createTransaction(
      this.filename,
      "Cannot open the file.",
      "-3"
    );

    await this.setStatus("BUSY", txn);
  }

  async markFail(remarks) {
    const txn = await this.createTransaction(this.filename, remarks, "-2");

    await this.setStatus("FAILED", txn);
  }

  async markProcessed(transacations) {
    const Archiver = new archiver();

    const txn = await this.createTransaction(
      this.filename,
      "File successfully processed.",
      "1"
    );

    const HotScanGenerator = new FileGenerator(
      1,
      transacations,
      this.filename,
      txn.reference_id
    );

    const TGSGenerator = new FileGenerator(
      2,
      transacations,
      this.filename,
      txn.reference_id
    );

    const rawTGS = TGSGenerator.generateRaw();
    const TGSValidation = new Validation(rawTGS);
    const { valid, message } = TGSValidation.validate();

    if (valid) {
      await HotScanGenerator.generate();
      await TGSGenerator.generate();

      const outPath = `${Helpers.tmpPath()}/inward/${txn.reference_id}`;

      await Drive.copy(this.path, `${outPath}/${this.path.split("\\").pop()}`);

      await Archiver.setOutput(
        `${Helpers.tmpPath()}/inward/${txn.reference_id}.zip`
      )
        .archiveDirectory(outPath)
        .catch(() => {});

      await Drive.delete(outPath);
      await this.setStatus("PROCESSED", txn);
    } else this.markFail(message);
  }

  async processFile() {
    const file = await Drive.get(this.path).catch((e) => {});

    if (!file) {
      this.markCannotOpen();
      return;
    }

    const read = file.toString();
    const txnCount = read.match(/Page/g).length;
    let transacations = {};

    if (txnCount > 0) {
      transacations = {
        dates: Parser.getDates(read) || [],
        senderName: Parser.getSenderNames(read) || [],
        currency: Parser.getCurrency(read) || [],
        amount: Parser.getAmounts(read) || [],
        accountNumbers: Parser.getAccountNumbers(read) || [],
        notes: Parser.getNotes(read) || [],
        maker: Parser.getMaker(read) || [],
        checker: Parser.getChecker(read) || [],
        reference: Parser.getReference(read) || [],
      };

      const check = Service.checkTransactionCount(transacations, txnCount);

      if (check) await this.markProcessed(transacations);
      else await this.markInvalid();
    } else this.markFail("Transaction column count mismatch.");
  }

  static checkTransactionCount(txns, count) {
    return Object.values(txns).every((txn) => txn.length == count);
  }
}

module.exports = Service;
