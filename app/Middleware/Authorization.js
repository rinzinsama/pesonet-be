"use strict";
const AuthenticationService = use("App/Controllers/Services/Authentication");
const { to } = use("await-to-js");

class Authorization {
  async handle({ request, response, auth }, next, type = "read") {
    const authorization = request.header("authorization");
    const session = await AuthenticationService.checkSession(authorization);

    if (!session)
      return response.status(401).json({ message: "Unauthenticated user." });

    const [err] = await to(auth.check());

    if (err) {
      await AuthenticationService.deleteSession(authorization);
      return response.status(401).json({ message: "Unauthenticated user." });
    }

    await next();

    if (type == "issue" && +response.response.statusCode < 400) {
      const user = auth.user;
      const jwtObject = await auth.generate(user);
      await AuthenticationService.deleteSession(authorization);
      await AuthenticationService.createSession(user, jwtObject.token);

      response.header("Authorization", `Bearer ${jwtObject.token}`);
    }
  }
}

module.exports = Authorization;
