const Role = use("App/Models/Role");

const valuesChangedRoleFn = async (data, field, message, args, get) => {
  const value = get(data, field);

  if (!value) return;

  const role = await Role.findBy("id", data.id);

  if (!role) return;

  const moduleInstance = await role.roleModules().fetch();
  const modules = moduleInstance.toJSON().map(modules => modules.module);

  const isEqual =
    modules.length === data.modules.length &&
    modules.every((item, index) => data.modules[index] === item);

  if (isEqual) throw message;
};

module.exports = valuesChangedRoleFn;
