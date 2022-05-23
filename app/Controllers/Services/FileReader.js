"use strict";
const BaseService = use("App/Controllers/Services/Base");
const FileReader = use("FileReader");
const FileReaderTransaction = use("App/Models/FileReaderTransaction");
const Helpers = use("Helpers");
const { to } = use("await-to-js");

class FileReaderService {
  static fields() {
    return ["reference_id", "filename"];
  }

  static async checkStatus() {
    const status = FileReader.getStatus();
    const statusCode = FileReader.getStatusCode();
    const path = FileReader.getPath();

    return BaseService.withDataResponseSerializer(
      { status: statusCode, path },
      null,
      `File reader is currently ${status.toLowerCase()}.`
    );
  }

  static async runReader() {
    let response = {};
    const statusCode = FileReader.getStatusCode();

    if (statusCode == 1)
      response = BaseService.noDataResponseSerializer(
        "File reader is already running.",
        200
      );
    else {
      const [err, data] = await to(FileReader.runReader());

      if (err)
        response = BaseService.noDataResponseSerializer(
          "File reader failed to run.",
          200
        );
      else
        response = BaseService.noDataResponseSerializer(
          `Running file reader on ${data.path}`,
          200
        );
    }

    return response;
  }

  static async updatePath(pathname) {
    let response = {};
    const [err, data] = await to(FileReader.updatePath(pathname));

    if (err)
      response = BaseService.noDataResponseSerializer(
        "File reader failed to run.",
        500
      );
    else
      response = BaseService.withDataResponseSerializer(
        { status: data.status, path: data.path },
        null,
        "Successfully updated read path."
      );

    return response;
  }

  static async getLogsByDate(date) {
    let response = {};
    const transaction = await FileReaderTransaction.query()
      .whereRaw("CAST(created_at as date) = ?", date)
      .orderBy("id", "desc")
      .fetch();

    if (transaction.rows.length > 0) {
      const parsedData = BaseService.camelCaseBody(transaction.toJSON());
      response = BaseService.withDataResponseSerializer(parsedData);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async getLogs(request) {
    const { search, page, limit, status } = request;
    let response = {};

    let query = FileReaderTransaction.query().orderBy("id", "desc");

    if (status && status != 0) query.where("status", status);

    if (search && search.length > 0)
      query = BaseService.searchQuery(
        query,
        FileReaderService.fields(),
        search
      );

    if (limit && !page) query.limit(limit);

    const { data, ...obj } = await BaseService.getData(query, page, limit);

    if (data.length == 0) response = BaseService.noDataResponseSerializer();
    else {
      const parsedData = BaseService.camelCaseBody(data);
      response = BaseService.withDataResponseSerializer(parsedData, obj);
    }

    return response;
  }

  static async downloadGeneratedFile(referenceId) {
    return Helpers.tmpPath(`inward/${referenceId}.zip`);
  }
}

module.exports = FileReaderService;
