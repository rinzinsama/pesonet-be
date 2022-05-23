"use strict";

const Factory = use("Factory");

class StatusListSeeder {
  async run() {
    let statusLists = [
      {
        status_code: "DS07",
        status_name: "ProcessingOK",
        description: "Successfully credited to customer's account",
        type: 1,
      },
      {
        status_code: "AC03",
        status_name: "InvalidCreditorAccountNumber",
        description:
          "Beneficiary account number is invalid for any reason (i.e incorrect account number, dormant, closed, blocked, frozen)",
        type: 2,
      },
      {
        status_code: "BE01",
        status_name: "InconsistentWithEndCustomer",
        description:
          "Account name of the Beneficiary Account does not match the name of the Beneficiary indicated in the Payment item",
        type: 2,
      },
      {
        status_code: "CURR",
        status_name: "IncorrectCurrency",
        description:
          "Currency of the Beneficiary Account does not match the currency of the Payment Item",
        type: 2,
      },
      {
        status_code: "AM21",
        status_name: "LimitExceeded",
        description:
          "Crediting the Beneficiary Account with the amount indicated in the Payment Item will cause the Benificary Account's balance limit to be exceeded",
        type: 2,
      },
      {
        status_code: "DS02",
        status_name: "OrderCancelled",
        description: "There was a recall instruction from the OFI",
        type: 2,
      },
      {
        status_code: "RR04",
        status_name: "RegulatoryReason",
        description:
          "Payment Item could not be credited to the Beneficiary Account because it requires additional information to comply with the Regulatory or Internal Risk Management Policies",
        type: 2,
      },
      {
        status_code: "AC06",
        status_name: "BlockedAccount",
        description: "Product/Account is not allowed to be funded via PESONet",
        type: 2,
      },
      {
        status_code: "DS04",
        status_name: "OrderRejected",
        description:
          "Beneficiary account could not be funded within the prescribed timeframe",
        type: 2,
      },
      {
        status_code: "DS06",
        status_name: "TransferOrder",
        description:
          "Funds have been held by the RFI to comply with OFAC regulations",
        type: 3,
      },
    ];

    await Factory.model("App/Models/StatusList").createMany(
      statusLists.length,
      statusLists
    );
  }
}

module.exports = StatusListSeeder;
