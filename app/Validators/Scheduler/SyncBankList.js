"use strict";
const Serializer = use("Library/Validator/Serializer");

class SchedulerSyncBankList {
  async authorize() {
    const user = this.ctx.auth.user;

    if (![1, 2, 3].includes(+user.role_id))
      return this.ctx.response.status(403).json({
        message: "You are not allowed access this method.",
      });

    return true;
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = SchedulerSyncBankList;
