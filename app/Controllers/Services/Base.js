"use strict";
const { camelCase } = use("camel-case");
const { snakeCase } = use("snake-case");

class BaseService {
  static searchQuery(query, fields, search) {
    query.where(function () {
      for (const field of fields) {
        this.orWhere(field, "LIKE", `%${search}%`);
      }
    });

    return query;
  }

  static async getData(query, page, limit) {
    let data;
    let isPagination = false;

    if (page && limit) {
      data = await query.paginate(page, limit);
      isPagination = true;
    } else data = await query.fetch();

    let jsonData = data.toJSON();

    if (isPagination) return jsonData;
    else return { data: jsonData };
  }

  static camelCaseBody(data) {
    let body;

    if (data instanceof Array) {
      body = [];

      data.forEach((data) => {
        const collection = BaseService.camelized(data);
        body.push(collection);
      });
    } else body = BaseService.camelized(data);

    return body;
  }

  static camelized(data) {
    const collection = {};

    Object.keys(data).map((key) => {
      collection[camelCase(key)] = data[key];
    });

    return collection;
  }

  static noDataResponseSerializer(message, status) {
    return {
      status: status || 404,
      body: {
        message: message || "No data found.",
      },
    };
  }

  static withDataResponseSerializer(data, obj, message, status) {
    return {
      status: status || 200,
      body: {
        message: message || "Successful data fetch.",
        data,
        ...obj,
      },
    };
  }

  static parseToSnakeCase(data) {
    let request = {};
    Object.keys(data).map((key) => {
      request[snakeCase(key)] = data[key];
    });

    return request;
  }
}

module.exports = BaseService;
