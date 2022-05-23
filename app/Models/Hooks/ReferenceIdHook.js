"use strict";
const randomstring = use("randomstring");
const moment = use("moment");

const ReferenceIdHook = (exports = module.exports = {});

ReferenceIdHook.generate = () => {
  let rand = randomstring.generate({
    length: 7,
    capitalization: "uppercase",
  });

  return `${moment().format("YYYYMMDD")}${rand}`;
};

ReferenceIdHook.generateReferenceID = async (modelInstance) => {
  modelInstance.reference_id = ReferenceIdHook.generate();
};
