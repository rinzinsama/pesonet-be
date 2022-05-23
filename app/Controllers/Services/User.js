"use strict";
const BaseService = use("App/Controllers/Services/Base");
const User = use("App/Models/User");
const Drive = use("Drive");

class UserService {
  static fields() {
    return [
      "reference_id",
      "username",
      "first_name",
      "last_name",
      "middle_name",
      "email",
    ];
  }

  static async getUsers(request) {
    const { search, page, limit, filter } = request;
    let response = {};
    let query = User.query().with("role");

    if (filter && +filter == -1) query.where("status", 0);
    else if (filter && +filter == -2) query.where("status", -1);
    else if (filter && ![0, -1, -2].includes(+filter))
      query.where("role_id", filter);
    else query.where("status", 1);

    if (search && search.length > 0)
      query = BaseService.searchQuery(query, UserService.fields(), search);

    if (limit && !page) query.limit(limit);

    query.orderBy("id", "asc");

    const { data, ...obj } = await BaseService.getData(query, page, limit);

    if (data.length == 0) response = BaseService.noDataResponseSerializer();
    else {
      data.map((user, key) => {
        data[key].role = user.role.role;
      });

      const parsedData = BaseService.camelCaseBody(data);
      response = BaseService.withDataResponseSerializer(parsedData, obj);
    }

    return response;
  }

  static async getUser(refId) {
    let response = {};
    let user = await User.findBy("reference_id", refId);
    await user.load("role");

    if (user) {
      const userData = user.toJSON();
      userData.role = userData.role.role;
      const parsedData = BaseService.camelCaseBody(userData);
      response = BaseService.withDataResponseSerializer(parsedData);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async createUser(data) {
    const parsedRequest = BaseService.parseToSnakeCase(data);

    const user = new User();
    user.merge(parsedRequest);

    await user.save();
    const parsedData = BaseService.camelCaseBody(user.toJSON());

    const response = BaseService.withDataResponseSerializer(
      parsedData,
      null,
      "Successfully created data."
    );

    return response;
  }

  static async updateUser(refID, data) {
    const parsedRequest = BaseService.parseToSnakeCase(data);
    const user = await User.findBy("reference_id", refID);

    user.merge(parsedRequest);
    await user.save();

    const parsedData = BaseService.camelCaseBody(user.toJSON());

    const response = BaseService.withDataResponseSerializer(
      parsedData,
      null,
      "Successfully updated data."
    );

    return response;
  }

  static async deleteUser(refId) {
    const user = await User.findBy("reference_id", refId);

    await user.delete();

    const login_count = await Drive.get("login_count.json", "utf8");
    let parsedLoginCount = JSON.parse(login_count);
    delete parsedLoginCount[user.username.toUpperCase()];

    await Drive.put(
      "login_count.json",
      JSON.stringify(parsedLoginCount, null, 4)
    );

    return BaseService.noDataResponseSerializer(
      "Successfully deleted user.",
      200
    );
  }

  static async unlockUser(refId) {
    const user = await User.findBy("reference_id", refId);

    user.merge({
      status: 1,
    });

    await user.save();

    const login_count = await Drive.get("login_count.json", "utf8");
    let parsedLoginCount = JSON.parse(login_count);
    delete parsedLoginCount[user.username.toUpperCase()];

    await Drive.put(
      "login_count.json",
      JSON.stringify(parsedLoginCount, null, 4)
    );

    return BaseService.noDataResponseSerializer(
      "Successfully unlocked user.",
      200
    );
  }

  static async changePassword(userInstance, password) {
    const user = await User.findBy("reference_id", userInstance.reference_id);

    user.merge({ password, is_password_changed: 1 });
    user.save();

    const parsedData = BaseService.camelCaseBody(user.toJSON());

    return BaseService.withDataResponseSerializer(
      parsedData,
      null,
      "Successfully changed password."
    );
  }
}

module.exports = UserService;
