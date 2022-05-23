"use strict";
const BaseService = use("App/Controllers/Services/Base");
const User = use("App/Models/User");
const Session = use("App/Models/Session");
const { to } = use("await-to-js");
const Drive = use("Drive");

class AuthenticationService {
  static async checkUsername(username) {
    let response = {};
    const user = await User.findBy("username", username.toUpperCase());

    if (user && user.status == 1)
      response = BaseService.noDataResponseSerializer("Username found.", 200);
    else if (user && user.status == 0)
      response = BaseService.noDataResponseSerializer(
        "Account is inactive.",
        400
      );
    else response = BaseService.noDataResponseSerializer("Username not found.");

    return response;
  }

  static async login(request, authInstance) {
    let response = {};
    const { username, password } = request;

    const user = await User.findBy("username", username.toUpperCase());
    let jwt, err;

    if (!user) {
      response = BaseService.noDataResponseSerializer(
        "Invalid credentials.",
        400
      );
    } else {
      const login_count = await Drive.get("login_count.json", "utf8");
      let parsedLoginCount = JSON.parse(login_count);

      [err, jwt] = await to(
        authInstance.attempt(username.toUpperCase(), password)
      );

      if (err) {
        parsedLoginCount[username.toUpperCase()] = parsedLoginCount[
          username.toUpperCase()
        ]
          ? +parsedLoginCount[username.toUpperCase()] + 1
          : 1;

        if (
          user.status != -1 &&
          parsedLoginCount[username.toUpperCase()] >= 3
        ) {
          user.merge({
            status: parsedLoginCount[username.toUpperCase()] == 3 ? 0 : -1,
          });

          await user.save();
        }

        await Drive.put(
          "login_count.json",
          JSON.stringify(parsedLoginCount, null, 4)
        );

        response = BaseService.noDataResponseSerializer(
          "Invalid credentials.",
          400
        );
      } else {
        if ([0, -1].includes(user.status))
          response = BaseService.noDataResponseSerializer(
            "Invalid credentials.",
            400
          );
        else {
          await AuthenticationService.createSession(user, jwt.token);
          await user.load("role");
          let role = user.getRelated("role");
          let module = await role.modules().where("status", 1).fetch();

          delete parsedLoginCount[user.username.toUpperCase()];

          await Drive.put(
            "login_count.json",
            JSON.stringify(parsedLoginCount, null, 4)
          );

          const { userData, modulesData } = AuthenticationService.flattenData(
            module.toJSON(),
            user.toJSON()
          );

          response = BaseService.withDataResponseSerializer(
            {
              user: userData,
              modules: modulesData,
            },
            null,
            "Successfully logged in."
          );
        }
      }
    }

    return { ...response, token: jwt ? jwt.token : null };
  }

  static async logout(token) {
    let session = null;

    if (token)
      session = await Session.findBy("token", token.replace("Bearer ", ""));

    if (session) await session.delete();

    return BaseService.noDataResponseSerializer(
      "Successfully logged out.",
      200
    );
  }

  static async reconnect(user) {
    await user.load("role");

    let role = user.getRelated("role");
    let module = await role.modules().fetch();

    const { userData, modulesData } = AuthenticationService.flattenData(
      module.toJSON(),
      user.toJSON()
    );

    return BaseService.withDataResponseSerializer({
      user: userData,
      modules: modulesData,
    });
  }

  static flattenData(modules, users) {
    let userData = users;
    let moduleData = modules.map((mod) => {
      delete mod.status;
      delete mod.pivot;
      return mod;
    });

    userData.role = userData.role.role;
    const parsedUserData = BaseService.camelCaseBody(userData);
    const parsedModuleData = BaseService.camelCaseBody(moduleData);

    return {
      userData: parsedUserData,
      modulesData: parsedModuleData,
    };
  }

  static async checkSession(token) {
    if (!token) return false;

    const session = await Session.findBy("token", token.replace("Bearer ", ""));

    return session ? true : false;
  }

  static async deleteSession(token) {
    const session = await Session.findBy("token", token.replace("Bearer ", ""));

    if (session) {
      await session.delete();
      return true;
    } else return false;
  }

  static async createSession(model, token) {
    return await model.sessions().create({ token });
  }
}

module.exports = AuthenticationService;
