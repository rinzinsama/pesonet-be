"use strict";

class Serializer {
  static getResponse(errorMessages, message = "Bad request.") {
    let errors = errorMessages.map(error => error.message);

    return {
      status: 400,
      body: {
        message,
        errors
      }
    };
  }
}

module.exports = Serializer;
