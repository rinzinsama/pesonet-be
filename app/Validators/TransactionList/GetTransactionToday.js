"use strict";
const Serializer = use("Library/Validator/Serializer");

class TransactionListGetTransactionToday {
  async authorize() {
    const user = this.ctx.auth.user;

    if (![2, 3].includes(+user.role_id))
      return this.ctx.response.status(403).json({
        message: "You are not allowed access this method.",
      });

    return true;
  }

  get rules() {
    return {
      type: "required|string|inStringArray:INWARD,OUTWARD",
    };
  }

  get messages() {
    return {
      "type.required": "(type) is required.",
      "type.string": "(type) must be string.",
      "type.inStringArray": "(type) value is invalid.",
    };
  }

  get sanitizationRules() {
    return {
      type: "trim",
    };
  }

  async fails(errorMessages) {
    const { status, body } = Serializer.getResponse(errorMessages);

    return this.ctx.response.status(status).send(body);
  }
}

module.exports = TransactionListGetTransactionToday;
