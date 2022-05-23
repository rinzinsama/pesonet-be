"use strict";
const refGenerator = use("App/Models/Hooks/ReferenceIdHook");

const OutwardHook = (exports = module.exports = {});

OutwardHook.defaultStatus = async (modelInstance) => {
  modelInstance.status = modelInstance.status || 0;
};

OutwardHook.defaultReferenceId = async (modelInstance) => {
  modelInstance.reference_id =
    modelInstance.reference_id || (await refGenerator.generate());
};

OutwardHook.defaultSequenceNumber = async (modelInstance) => {
  modelInstance.sequence_number = modelInstance.sequence_number || null;
};

OutwardHook.defaultCycle = async (modelInstance) => {
  modelInstance.cycle = modelInstance.cycle || null;
};

OutwardHook.defaultSettlementDate = async (modelInstance) => {
  modelInstance.settlement_date = modelInstance.settlement_date || null;
};

OutwardHook.defaultNumberOfBatch = async (modelInstance) => {
  modelInstance.number_of_batch = modelInstance.number_of_batch || 1;
};

OutwardHook.defaultIsSent = async (modelInstance) => {
  modelInstance.is_sent = modelInstance.is_sent || 0;
};

OutwardHook.defaultLocalExternalCode = async (modelInstance) => {
  modelInstance.local_external_code = modelInstance.local_external_code || "";
};

OutwardHook.defaultProcessing = async (modelInstance) => {
  modelInstance.processing = modelInstance.processing || 0;
};
