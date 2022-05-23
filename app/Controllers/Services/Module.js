"use strict";
const BaseService = use("App/Controllers/Services/Base");
const Module = use("App/Models/Module");
const Role = use("App/Models/Role");
const RoleModule = use("App/Models/RoleModule");
const Socket = use("Socket");

class ModuleService {
  static async getModules(status) {
    let response = {};
    let query = Module.query();

    if (typeof status != "undefined") query.where("status", status);

    const module = await query.with("roles").fetch();

    if (module.rows.length > 0) {
      const moduleData = module.toJSON().map((collection) => {
        const { roles, ...args } = collection;
        const flatRole = roles.map((roleCollection) => {
          const { id, role } = roleCollection;
          return { id, role };
        });

        return {
          ...args,
          roles: flatRole,
        };
      });

      const parsedData = BaseService.camelCaseBody(moduleData);

      response = BaseService.withDataResponseSerializer(parsedData);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async getRoleModules(id) {
    let response = {};

    const roleModules = await RoleModule.query()
      .setVisible(["module"])
      .where("role_id", id)
      .fetch();

    if (roleModules.rows.length > 0) {
      const flatData = roleModules.toJSON().map((modules) => modules.module);
      response = BaseService.withDataResponseSerializer(flatData);
    } else response = BaseService.noDataResponseSerializer();

    return response;
  }

  static async updateModule(request) {
    const { modules, id } = request;

    const role = await Role.findBy("id", id);

    const saveModules = modules.map((mod) => {
      const roleModule = new RoleModule();
      roleModule.merge({ role_id: role.id, module: mod });

      return roleModule;
    });

    await role.roleModules().delete();
    await role.roleModules().saveMany(saveModules);

    const newModules = saveModules.map((savedModule) => {
      let mod = savedModule.toJSON();
      delete mod.role_id;
      return mod;
    });

    const roleModules = Object.assign(role.toJSON(), { modules: newModules });

    Socket.broadcastData("Module", "save", {
      message: "New Entry",
      roleId: role.id,
      modules: newModules.map((mod) => mod.module),
    });

    return BaseService.withDataResponseSerializer(
      roleModules,
      null,
      "Successfully updated allowed module/s."
    );
  }
}

module.exports = ModuleService;
