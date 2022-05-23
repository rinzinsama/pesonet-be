"use strict";
const moment = use("moment");
const Drive = use("Drive");
const Helpers = use("Helpers");
const TransactionList = use("App/Models/TransactionList");

class Service {
  parseDisplayAmount(amount) {
    const amt = `${amount}`.replace(/,/g, "");

    return (+amt).toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  generateAddress(address) {
    return address.join("");
  }

  generateDataInward(obj) {
    return {
      endToEndId: obj.PmtId.EndToEndId,
      ofiReferenceNumber: obj.PmtId.TxId,
      ofiCustomerReferenceNumber:
        obj.RmtInf.Ustrd.ofi_customer_reference_number,
      rfiReferenceNumber: obj.RmtInf.Ustrd.rfi_reference_number,
      rfiCustomerReferenceNumber:
        obj.RmtInf.Ustrd.rfi_customer_reference_number,
      instructions: obj.RmtInf.Ustrd.instructions,
      currency: obj.IntrBkSttlmAmt.Ccy,
      amount: this.parseDisplayAmount(obj.IntrBkSttlmAmt.value),
      remitterName: obj.Dbtr.Nm,
      remitterAddress: this.generateAddress(obj.Dbtr.PstlAdr),
      remitterAccountNumber: obj.DbtrAcct.Id.Othr.Id,
      remitterBIC: obj.DbtrAgt.FinInstnId.BICFI,
      beneficiaryName: obj.Cdtr.Nm,
      beneficiaryAddress: this.generateAddress(obj.Cdtr.PstlAdr),
      beneficiaryAccountNumber: obj.CdtrAcct.Id.Othr.Id,
      beneficiaryBIC: obj.CdtrAgt.FinInstnId.BICFI,
      sent: obj.sentStatus || false,
      status: obj.status,
      remarks: obj.remarks,
    };
  }
}

module.exports = Service;
