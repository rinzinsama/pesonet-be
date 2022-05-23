"use strict";
const archiver = use("archiver");
const fs = use("fs");

class Service {
  constructor() {
    this.output = "";
    this.archive = archiver("zip", {
      zlib: { level: 9 },
    });
  }

  setOutput(path) {
    //this should be path and filename with extension. eg. folder/file.zip
    this.output = fs.createWriteStream(path);

    return this;
  }

  archiveDirectory(directory) {
    // directory to archive
    return new Promise((resolve, reject) => {
      this.archive.on("error", (err) => {
        reject("Failed to create zip.");
      });

      this.output.on("close", () => {
        resolve("Created zip.");
      });

      this.archive.pipe(this.output);

      this.archive.directory(directory, false);

      this.archive.finalize();
    });
  }
}

module.exports = Service;
