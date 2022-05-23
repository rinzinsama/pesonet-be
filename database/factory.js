"use strict";

const Factory = use("Factory");
const Drive = use("Drive");
const Helpers = use("Helpers");

Factory.blueprint("App/Models/Role", (faker, i, data) => {
  return {
    role: data,
  };
});

Factory.blueprint("App/Models/User", (faker, i, data) => {
  return {
    username: "administrator",
    first_name: "MUFG",
    last_name: "ADMIN",
    email: "email@email.email",
    is_password_changed: 1,
    password: "password",
    role_id: 1,
  };
});

Factory.blueprint("App/Models/Module", (faker, i, data) => {
  return {
    module: data[i].module,
    description: data[i].description,
  };
});

Factory.blueprint("App/Models/RoleModule", (faker, i, data) => {
  return {
    role_id: data[i].role_id,
    module: data[i].module,
  };
});

Factory.blueprint("App/Models/StatusType", (faker, i, data) => {
  return {
    type: data[i].type,
  };
});

Factory.blueprint("App/Models/StatusList", (faker, i, data) => {
  return {
    status_code: data[i].status_code,
    status_name: data[i].status_name,
    description: data[i].description,
    type: data[i].type,
  };
});
