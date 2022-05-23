"use strict";
const BaseService = use("App/Controllers/Services/Base");
const TransactionList = use("App/Models/TransactionList");
const Outward = use("App/Models/Outward");
const Inward = use("App/Models/Inward");
const moment = use("moment");
const Helpers = use("Helpers");
const Drive = use("Drive");
const TransactionListLibService = use("Library/TransactionList/Service");

class TransactionListService {
  static fields() {
    return [
      "ofi_reference_number",
      "rfi_reference_number",
      "ofi_customer_reference_number",
      "rfi_customer_reference_number",
      "amount",
      "remitter_name",
      "remitter_account_number",
      "creditor_name",
      "creditor_account_number",
      "sequence_number",
    ];
  }

  static async getTransactionList(request) {
    const { search, page, limit, filter, date } = request;
    let response = {};
    let query = TransactionList.query();

    if (`${filter}` && ["INWARD", "OUTWARD"].includes(filter))
      query.where("type", filter);
    else if (`${filter}` && `${filter}` == "2" && date)
      query.whereRaw("CAST(settlement_date as date) = ?", [date]);

    if (search && search.length > 0)
      query = BaseService.searchQuery(
        query,
        TransactionListService.fields(),
        search
      );

    if (limit && !page) query.limit(limit);

    query.orderBy("sequence_number", "desc");

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

  static async getTransaction(refId) {
    let response = {};
    let transaction = await TransactionList.findBy("reference_id", refId);

    const transData = transaction.toJSON();
    let forResponse;

    if (transData.type == "INWARD") {
      const data = await Drive.get(
        Helpers.tmpPath(`inward_message/${transData.sequence_number}.json`),
        "utf8"
      );
      const parsedData = JSON.parse(data);
      const lookup = parsedData.CdtTrfTxInf.find(
        (txn) => txn.PmtId.TxId == transData.ofi_reference_number
      );

      const TLService = new TransactionListLibService();
      forResponse = TLService.generateDataInward(lookup);
    } else {
      const outwardModel = await Outward.query()
        .where("sequence_number", "LIKE", `%${transData.sequence_number}%`)
        .first();
      const outwardMessage = await Drive.get(
        Helpers.tmpPath(
          `outward_message/${outwardModel.reference_id}-upload.json`
        ),
        "utf8"
      );
      const { transactions } = JSON.parse(outwardMessage);
      forResponse = transactions.find(
        (txn) => txn.ofiReferenceNumber == transData.ofi_reference_number
      );
    }

    return BaseService.withDataResponseSerializer(forResponse);
  }

  static async getTransactionToday(type) {
    let response;
    const dupes = await TransactionList.query()
      .whereRaw("CAST(created_at as date) = ? ", [
        moment().format("YYYY-MM-DD"),
      ])
      .where("type", type)
      .fetch();

    if (dupes.rows.length == 0)
      response = BaseService.noDataResponseSerializer();
    else {
      const parsedData = BaseService.camelCaseBody(dupes.toJSON());
      response = BaseService.withDataResponseSerializer(parsedData);
    }

    return response;
  }
}

module.exports = TransactionListService;
