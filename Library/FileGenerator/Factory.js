"use strict";
const HotScan = use("Library/FileGenerator/HotScan");
const TGS = use("Library/FileGenerator/TGS");

class Factory {
  constructor(type, txn, filename, directory, startingIndex) {
    //1 = HotScan
    //2 = TGS
    this.type = type;
    this.transaction = txn;
    this.filename = filename;
    this.directory = directory;
    this.startingIndex = startingIndex;
  }

  async generate() {
    let instance = null;
    if (this.type == 1)
      instance = new HotScan(
        this.transaction,
        this.filename,
        this.directory,
        this.startingIndex
      );
    else
      instance = new TGS(
        this.transaction,
        this.filename,
        this.directory,
        this.startingIndex
      );

    return await instance.generate();
  }

  generateRaw() {
    let instance = null;
    if (this.type == 1)
      instance = new HotScan(
        this.transaction,
        this.filename,
        this.directory,
        this.startingIndex
      );
    else
      instance = new TGS(
        this.transaction,
        this.filename,
        this.directory,
        this.startingIndex
      );

    return instance.generateRaw();
  }
}

module.exports = Factory;
