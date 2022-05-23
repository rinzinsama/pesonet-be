class Validation {
  constructor(transactions) {
    this.transactions = transactions;
    this.errorRack = [];
  }

  validate() {
    const transactionIdValid = this.validateTransactionId();
    const senderNameValid = this.validateSenderName();
    const ccyValid = this.validateCCY();
    const amountValid = this.validateAmount();
    const accountNumberValid = this.validateAccountNumber();
    const noteValid = this.validateNote();
    const makerValid = this.validateMaker();
    const checkerValid = this.validateChecker();
    const referenceValid = this.validateReference();

    return {
      valid:
        transactionIdValid &&
        senderNameValid &&
        ccyValid &&
        amountValid &&
        accountNumberValid &&
        noteValid &&
        makerValid &&
        checkerValid &&
        referenceValid,
      message:
        this.errorRack.length > 0
          ? this.errorRack.join(" ")
          : "No errors found.",
    };
  }

  validateTransactionId() {
    const isValid = this.transactions.partition2.every(
      ({ D: transId }) => transId.length <= 19
    );

    if (!isValid) this.errorRack.push("(D) Transaction ID length is invalid.");

    return isValid;
  }

  validateSenderName() {
    const isValid = this.transactions.partition6.every(
      ({ W: senderName }) => senderName.length <= 16
    );

    if (!isValid) this.errorRack.push("(W) Sender Name length is invalid.");

    return isValid;
  }

  validateCCY() {
    const isValid = this.transactions.partition6.every(
      ({ X: ccy }) => ccy.length <= 3
    );

    if (!isValid) this.errorRack.push("(X) CCY length is invalid.");

    return isValid;
  }

  validateAmount() {
    const isValid = this.transactions.partition6.every(
      ({ Y: amount }) => amount.length <= 16
    );

    if (!isValid) this.errorRack.push("(Y) Amount length is invalid.");

    return isValid;
  }

  validateAccountNumber() {
    const isValid = this.transactions.partition8.every(
      ({ AC: accountNumber }) => accountNumber.length <= 6
    );

    if (!isValid) this.errorRack.push("(AC) Account Number length is invalid.");

    return isValid;
  }

  validateNote() {
    const isValid = this.transactions.partition9.every(
      ({ CG: note }) => note.length <= 255
    );

    if (!isValid) this.errorRack.push("(CG) Note length is invalid.");

    return isValid;
  }

  validateMaker() {
    const isValid = this.transactions.partition11.every(
      ({ CN: maker }) => maker.length <= 255
    );

    if (!isValid) this.errorRack.push("(CN) Maker length is invalid.");

    return isValid;
  }

  validateChecker() {
    const isValid = this.transactions.partition11.every(
      ({ CO: checker }) => checker.length <= 255
    );

    if (!isValid) this.errorRack.push("(CO) Checker length is invalid.");

    return isValid;
  }

  validateReference() {
    const isValid = this.transactions.partition12.every(
      ({ DM: reference }) => reference.length <= 16
    );

    if (!isValid) this.errorRack.push("(DM) Reference length is invalid.");

    return isValid;
  }
}

module.exports = Validation;
