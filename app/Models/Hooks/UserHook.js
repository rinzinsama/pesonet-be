"use strict";
const Hash = use("Hash");

const UserHook = (exports = module.exports = {});

UserHook.hashPassword = async modelInstance => {
  if (modelInstance.dirty.password)
    modelInstance.password = await Hash.make(modelInstance.password);
};

UserHook.upperCaseUsername = async modelInstance => {
  modelInstance.username = modelInstance.username.toUpperCase();
};

UserHook.defaultMiddleName = async modelInstance => {
  modelInstance.middle_name = modelInstance.middle_name || "";
};

UserHook.defaultIsPasswordChanged = async modelInstance => {
  modelInstance.is_password_changed = modelInstance.is_password_changed || 0;
};

UserHook.defaultIsPassword = async modelInstance => {
  modelInstance.password = "password";
};
