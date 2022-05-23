"use strict";
const chokidar = use("chokidar");
const { green, red } = require("kleur");
const Logger = use("Logger");
const moment = use("moment");
const Drive = use("Drive");
const Helpers = use("Helpers");
const FileReader = use("Library/FileReader/Service");

class Singleton {
  constructor() {
    this.status = "Stopped";
    this.statusCode = 0;
    this.path = "";
    this.watcher;
    this.directoryCheck;
  }

  async init() {
    const currentPath = await Drive.get(Helpers.tmpPath("path.txt"));
    this.path = currentPath.toString();

    this.runDirectoryReader();
    await this.runReader().catch((e) => {});
  }

  async checkPath() {
    return this.path && (await Drive.exists(this.path)) ? true : false;
  }

  getPath() {
    return this.path;
  }

  getStatus() {
    return this.status;
  }

  getStatusCode() {
    return this.statusCode;
  }

  runReader() {
    return new Promise(async (resolve, reject) => {
      if (!(await this.checkPath())) {
        reject("Path does not exist");
        const err = new Error();
        err.stack = "Path does not exist";
        this.onError(err);
      } else
        this.watcher = chokidar
          .watch(this.path, {
            persistent: true,
            ignored: /invalid|processed|failed|busy/gi,
          })
          .on("add", this.onAdd)
          .on("unlink", this.onRemove)
          .on("error", (error) => {
            reject(error);
            this.onError(error);
          })
          .on("ready", () => {
            resolve({ path: this.path, status: this.statusCode });
            this.onReady();
          });
    });
  }

  async updatePath(pathname) {
    await Drive.put(Helpers.tmpPath("path.txt"), pathname);
    this.path = pathname;
    this.statusCode = 0;
    this.status = "Stopped";

    if (this.watcher) await this.watcher.close();

    this.onStop();
    await this.restartDirectoryReader();
    return await this.runReader();
  }

  async restartDirectoryReader() {
    await this.directoryCheck.close();
    this.runDirectoryReader();

    return true;
  }

  async onAdd(path) {
    const Service = new FileReader(path);
    await Service.process();

    Logger.transport("reader").info({
      timestamp: moment().format("MMMM D, YYYY - h:mm:ss A"),
      type: "Added",
      path,
    });
  }

  onRemove(path) {
    Logger.transport("reader").info({
      timestamp: moment().format("MMMM D, YYYY - h:mm:ss A"),
      type: "Removed",
      path,
    });
  }

  onError(error) {
    Logger.transport("reader").info({
      timestamp: moment().format("MMMM D, YYYY - h:mm:ss A"),
      type: "Error",
      error: error.stack.replace(/\n\s+/gm, " "),
    });
  }

  onReady() {
    const Socket = use("Socket");
    Socket.broadcastData("FileReader", "status", "Status Update");

    console.log(`${green("info")}: file reader is running on ${this.path}`);

    Logger.transport("reader").info({
      timestamp: moment().format("MMMM D, YYYY - h:mm:ss A"),
      type: "Started",
      path: this.path,
    });

    this.status = "Running";
    this.statusCode = 1;
  }

  onStop() {
    const Socket = use("Socket");
    Socket.broadcastData("FileReader", "status", "Status Update");

    console.log(`${red("info")}: file reader is not running.`);

    Logger.transport("reader").info({
      timestamp: moment().format("MMMM D, YYYY - h:mm:ss A"),
      type: "Stopped",
    });
  }

  runDirectoryReader() {
    const pathRack = this.path.split("/");
    pathRack.pop();

    this.directoryCheck = chokidar
      .watch(pathRack.join("/"), {
        persistent: true,
        depth: 0,
        ignoreInitial: true,
      })
      .on("addDir", (path) => this.onAddDir(path))
      .on("unlinkDir", (path) => this.onRemoveDir(path));
  }

  async onAddDir(path) {
    const check = this.matchDirectory(path);

    if (check) await this.runReader().catch((e) => {});
  }

  async onRemoveDir(path) {
    const check = this.matchDirectory(path);
    this.statusCode = 0;
    this.status = "Stopped";

    if (check) {
      await this.watcher.close();
      this.onStop();
    }
  }

  matchDirectory(path) {
    const matchPath = path.split("\\").pop();
    const actualPath = this.path.split("/").pop();

    return matchPath == actualPath;
  }
}

module.exports = Singleton;
