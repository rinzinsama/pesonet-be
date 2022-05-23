"use strict";
const BaseService = use("App/Controllers/Services/Base");
const PesonetTransaction = use("App/Models/PesonetTransaction");
const Outward = use("App/Models/Outward");
const Inward = use("App/Models/Inward");

class TransactionLogService {
  static async getLogs(request) {
    let response = {};
    const { referenceId, type } = request;
    let transInstance;

    if (type == "INWARD")
      transInstance = await Inward.findBy("reference_id", referenceId);
    else transInstance = await Outward.findBy("reference_id", referenceId);

    const logs = await PesonetTransaction.query()
      .where({
        transaction_id: transInstance.id,
        type,
      })
      .with("userDetail")
      .fetch();

    if (logs.rows.length > 0) {
      let parsedData = logs.toJSON();

      parsedData.map((data, key) => {
        parsedData[key].fullname = data.userDetail
          ? data.userDetail.fullname
          : "";
        delete parsedData[key].userDetail;
      });

      parsedData = BaseService.camelCaseBody(parsedData);
      response = BaseService.withDataResponseSerializer(parsedData);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }
}

module.exports = TransactionLogService;
