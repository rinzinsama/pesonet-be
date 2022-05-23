"use strict";

const UserService = use("App/Controllers/Services/User");

class UserController {
  async getUsers({ request, response }) {
    const { status, body } = await UserService.getUsers(request.all());

    return response.status(status).send(body);
  }

  async getUser({ request, response }) {
    const { status, body } = await UserService.getUser(
      request.input("referenceId")
    );

    return response.status(status).send(body);
  }

  async createUser({ request, response }) {
    const requestData = request.only([
      "username",
      "firstName",
      "lastName",
      "middleName",
      "email",
      "roleId",
    ]);

    const { status, body } = await UserService.createUser(requestData);
    return response.status(status).send(body);
  }

  async updateUser({ request, response }) {
    const referenceId = request.input("referenceId");
    const requestData = request.only([
      "username",
      "firstName",
      "lastName",
      "middleName",
      "email",
      "roleId",
      "status",
    ]);

    const { status, body } = await UserService.updateUser(
      referenceId,
      requestData
    );
    return response.status(status).send(body);
  }

  async deleteUser({ request, response }) {
    const { status, body } = await UserService.deleteUser(
      request.input("referenceId")
    );

    return response.status(status).send(body);
  }

  async unlockUser({ request, response }) {
    const { status, body } = await UserService.unlockUser(
      request.input("referenceId")
    );

    return response.status(status).send(body);
  }

  async changePassword({ request, response, auth }) {
    const { status, body } = await UserService.changePassword(
      auth.user,
      request.input("newPassword")
    );

    return response.status(status).send(body);
  }
}

module.exports = UserController;
