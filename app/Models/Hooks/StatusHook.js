"use strict";

const StatusHook = (exports = module.exports = {});

StatusHook.generateStatus = async modelInstance => {
  modelInstance.status = modelInstance.status || 1;
};
