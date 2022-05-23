"use strict";
const Serializer = use("Library/Validator/Serializer");

class BankListGetBankBIC {
  async authorize() {
    const user = this.ctx.auth.user;

    if (![1, 2, 3].includes(+user.role_id))
      return this.ctx.response.status(403).json({
        message: "You are not allowed access this method.",
      });

    return true;
  }
}

module.exports = BankListGetBankBIC;
