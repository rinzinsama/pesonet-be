"use strict";
const AuthenticationService = use("App/Controllers/Services/Authentication");

class AuthenticationController {
  async checkUsername({ request, response }) {
    const { status, body } = await AuthenticationService.checkUsername(
      request.input("username")
    );

    return response.status(status).send(body);
  }

  async login({ request, response, auth }) {
    const { status, body, token } = await AuthenticationService.login(
      request.all(),
      auth
    );

    if (token) response.header("Authorization", `Bearer ${token}`);
    return response.status(status).send(body);
  }

  async logout({ request, response }) {
    const { status, body } = await AuthenticationService.logout(
      request.header("authorization")
    );

    return response.status(status).send(body);
  }

  async reconnect({ response, auth }) {
    const { status, body } = await AuthenticationService.reconnect(auth.user);
    
    return response.status(status).send(body);
  }
}

module.exports = AuthenticationController;
