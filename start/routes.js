"use strict";

const Route = use("Route");

Route.group(() => {
  Route.get("/", ({ response }) => "API Server is running.");

  //Authentication routes
  Route.post(
    "/auth/checkUsername",
    "AuthenticationController.checkUsername"
  ).validator("Authentication/CheckUsername");
  Route.post("/auth/login", "AuthenticationController.login").validator(
    "Authentication/Login"
  );
  Route.post("/auth/logout", "AuthenticationController.logout");
  Route.post(
    "/auth/reconnect",
    "AuthenticationController.reconnect"
  ).middleware("auth");

  //Role routes
  Route.post("/role/getRoles", "RoleController.getRoles").middleware("auth");

  //User routes
  Route.post("/user/getUsers", "UserController.getUsers")
    .middleware("auth")
    .validator("User/GetUsers");
  Route.post("/user/getUser", "UserController.getUser")
    .middleware("auth")
    .validator("User/GetUser");
  Route.post("/user/createUser", "UserController.createUser")
    .middleware("auth:issue")
    .validator("User/CreateUser");
  Route.post("/user/updateUser", "UserController.updateUser")
    .middleware("auth:issue")
    .validator("User/UpdateUser");
  Route.post("/user/deleteUser", "UserController.deleteUser")
    .middleware("auth")
    .validator("User/DeleteUser");
  Route.post("/user/unlockUser", "UserController.unlockUser")
    .middleware("auth")
    .validator("User/UnlockUser");
  Route.post("/user/changePassword", "UserController.changePassword")
    .middleware("auth")
    .validator("User/ChangePassword");

  //Module Routes
  Route.post("/module/getModules", "ModuleController.getModules")
    .middleware("auth")
    .validator("Module/GetModules");
  Route.post("/module/getRoleModules", "ModuleController.getRoleModules")
    .middleware("auth")
    .validator("Module/GetRoleModules");
  Route.post("/module/updateModule", "ModuleController.updateModule")
    .middleware("auth:issue")
    .validator("Module/UpdateModule");

  //File Reader Routes
  Route.post(
    "/reader/checkStatus",
    "FileReaderController.checkStatus"
  ).middleware("auth");
  // Route.post("/reader/runReader", "FileReaderController.runReader").middleware(
  //   "auth"
  // );
  Route.post("/reader/updatePath", "FileReaderController.updatePath")
    .middleware("auth:issue")
    .validator("FileReader/UpdatePath");
  Route.post("/reader/getLogsByDate", "FileReaderController.getLogsByDate")
    .middleware("auth")
    .validator("FileReader/GetLogsByDate");
  Route.post("/reader/getLogs", "FileReaderController.getLogs")
    .middleware("auth")
    .validator("FileReader/GetLogs");
  Route.post(
    "/reader/downloadGeneratedFile",
    "FileReaderController.downloadGeneratedFile"
  ).middleware("auth");
  // .validator("FileReader/DownloadGeneratedFile");

  //Audit Trail routes
  Route.post("/audit/getAuditTrail", "AuditTrailController.getAuditTrail")
    .middleware("auth")
    .validator("AuditTrail/GetAuditTrail");

  //API routes
  Route.post("/api/getApiSettings", "ApiController.getApiSettings").middleware(
    "auth"
  );
  Route.post("/api/uploadCreds", "ApiController.uploadCreds")
    .middleware("auth")
    .validator("API/UploadCreds");
  Route.post("/api/updateAPISettings", "ApiController.updateAPISettings")
    .middleware("auth")
    .validator("API/UpdateAPISettings");
  Route.post("/api/sendHeartbeat", "ApiController.sendHeartbeat").middleware(
    "auth"
  );
  Route.post("/api/sendIndex", "ApiController.sendIndex")
    .middleware("auth")
    .validator("API/SendIndex");
  Route.post("/api/sendInwardBatch", "ApiController.sendInwardBatch")
    .middleware("auth")
    .validator("API/SendInwardBatch");
  Route.post("/api/sendOutwardMessage", "ApiController.sendOutwardMessage")
    .middleware("auth")
    .validator("API/SendOutwardMessage");
  Route.post(
    "/api/sendOutwardMessageStatusUpdate",
    "ApiController.sendOutwardMessageStatusUpdate"
  )
    .middleware("auth")
    .validator("API/SendOutwardMessageStatusUpdate");
  Route.post(
    "/api/sendOutwardMessageSearch",
    "ApiController.sendOutwardMessageSearch"
  )
    .middleware("auth")
    .validator("API/SendOutwardMessageSearch");
  Route.post(
    "/api/sendInwardBatchStatusUpdate",
    "ApiController.sendInwardBatchStatusUpdate"
  )
    .middleware("auth")
    .validator("API/SendInwardBatchStatusUpdate");
  Route.post("/api/getLogs", "ApiController.getLogs")
    .middleware("auth")
    .validator("API/GetLogs");
  Route.post("/api/sendBankList", "ApiController.sendBankList").middleware(
    "auth"
  );

  //Scheduler routes
  Route.post(
    "/scheduler/getSchedulerLogs",
    "SchedulerController.getSchedulerLogs"
  )
    .middleware("auth")
    .validator("Scheduler/GetSchedulerLogs");
  Route.post("/scheduler/getlastSync", "SchedulerController.getlastSync")
    .middleware("auth")
    .validator("Scheduler/GetlastSync");
  Route.post("/scheduler/syncIndex", "SchedulerController.syncIndex")
    .middleware("auth")
    .validator("Scheduler/SyncIndex");
  Route.post("/scheduler/syncBankList", "SchedulerController.syncBankList")
    .middleware("auth")
    .validator("Scheduler/SyncBankList");
  Route.post("/scheduler/isSyncing", "SchedulerController.isSyncing")
    .middleware("auth")
    .validator("Scheduler/IsSyncing");

  //Bank List routes
  Route.post(
    "/banklist/getBankList",
    "BankListController.getBankList"
  ).middleware("auth");
  Route.post("/banklist/updateBank", "BankListController.updateBank")
    .middleware("auth")
    .validator("BankList/UpdateBank");
  Route.post("/banklist/getBankBIC", "BankListController.getBankBIC")
    .middleware("auth")
    .validator("BankList/GetBankBIC");

  //Inward batch routes
  Route.post("/inward/getInwardBatch", "InwardController.getInwardBatch")
    .middleware("auth")
    .validator("Inward/GetInwardBatch");
  Route.post(
    "/inward/getConsolidatedInwardBatch",
    "InwardController.getConsolidatedInwardBatch"
  )
    .middleware("auth")
    .validator("Inward/GetConsolidatedInwardBatch");
  Route.post(
    "/inward/getConsolidatedTotals",
    "InwardController.getConsolidatedTotals"
  )
    .middleware("auth")
    .validator("Inward/GetConsolidatedTotals");
  Route.post("/inward/getTransactions", "InwardController.getTransactions")
    .middleware("auth")
    .validator("Inward/GetTransactions");
  Route.post("/inward/downloadFile", "InwardController.downloadFile")
    .middleware("auth")
    .validator("Inward/DownloadFile");
  Route.post("/inward/updateStatus", "InwardController.updateStatus")
    .middleware("auth")
    .validator("Inward/UpdateStatus");
  Route.post("/inward/reject", "InwardController.reject")
    .middleware("auth")
    .validator("Inward/Reject");
  Route.post("/inward/sendStatus", "InwardController.sendStatus")
    .middleware("auth")
    .validator("Inward/SendStatus");
  Route.post("/inward/generatePDF", "InwardController.generatePDF")
    .middleware("auth")
    .validator("Inward/GeneratePDF");
  Route.post(
    "/inward/generateFilePDF",
    "InwardController.generateFilePDF"
  ).middleware("auth");
  Route.post(
    "/inward/getTransactionForFileGeneration",
    "InwardController.getTransactionForFileGeneration"
  )
    .middleware("auth")
    .validator("Inward/GetTransactionForFileGeneration");
  Route.post(
    "/inward/downloadGroupFile",
    "InwardController.downloadGroupFile"
  ).middleware("auth");
  Route.post(
    "/inward/getConsolidatedTransactions",
    "InwardController.getConsolidatedTransactions"
  )
    .middleware("auth")
    .validator("Inward/GetConsolidatedTransactions");
  Route.post(
    "/inward/saveConsolidatedInward",
    "InwardController.saveConsolidatedInward"
  )
    .middleware("auth")
    .validator("Inward/SaveConsolidatedInward");
  Route.post("/inward/regenerateFiles", "InwardController.regenerateFiles")
    .middleware("auth")
    .validator("Inward/RegenerateFiles");
  Route.post(
    "/inward/getInwardConsolidatedLogs",
    "InwardController.getInwardConsolidatedLogs"
  )
    .middleware("auth")
    .validator("Inward/GetInwardConsolidatedLogs");
  Route.post("/inward/checkForResync", "InwardController.checkForResync")
    .middleware("auth")
    .validator("Inward/CheckForResync");
  Route.post("/inward/reSyncInward", "InwardController.reSyncInward")
    .middleware("auth")
    .validator("Inward/ReSyncInward");
  Route.post(
    "/inward/generatePDFTable",
    "InwardController.generatePDFTable"
  ).middleware("auth");

  //Outward batch routes
  Route.post("/outward/getOutwardBatch", "OutwardController.getOutwardBatch")
    .middleware("auth")
    .validator("Outward/GetOutwardBatch");
  Route.post(
    "/outward/getTransactionsRaw",
    "OutwardController.getTransactionsRaw"
  )
    .middleware("auth")
    .validator("Outward/GetTransactionsRaw");
  Route.post("/outward/getTransactions", "OutwardController.getTransactions")
    .middleware("auth")
    .validator("Outward/GetTransactions");
  Route.post(
    "/outward/createOutwardMessage",
    "OutwardController.createOutwardMessage"
  )
    .middleware("auth")
    .validator("Outward/CreateOutwardMessage");
  Route.post("/outward/reject", "OutwardController.reject")
    .middleware("auth")
    .validator("Outward/Reject");
  Route.post(
    "/outward/saveOutwardMessage",
    "OutwardController.saveOutwardMessage"
  )
    .middleware("auth")
    .validator("Outward/SaveOutwardMessage");
  Route.post(
    "/outward/sendOutwardMessage",
    "OutwardController.sendOutwardMessage"
  )
    .middleware("auth")
    .validator("Outward/SendOutwardMessage");
  Route.post(
    "/outward/uploadOutward",
    "OutwardController.uploadOutward"
  ).middleware("auth");
  Route.post("/outward/generatePDF", "OutwardController.generatePDF")
    .middleware("auth")
    .validator("Outward/GeneratePDF");
  Route.post(
    "/outward/validateOutwardMessage",
    "OutwardController.validateOutwardMessage"
  )
    .middleware("auth")
    .validator("Outward/ValidateOutwardMessage");
  Route.post(
    "/outward/checkOutwardProcessing",
    "OutwardController.checkOutwardProcessing"
  ).middleware("auth");
  Route.post(
    "/outward/enableOutwardProcessing",
    "OutwardController.enableOutwardProcessing"
  ).middleware("auth");

  //Status type routes
  Route.post(
    "/statustype/getTypes",
    "StatusTypeController.getTypes"
  ).middleware("auth");

  //Status list routes
  Route.post("/statuslist/getLists", "StatusListController.getLists")
    .middleware("auth")
    .validator("StatusList/GetLists");
  Route.post(
    "/statuslist/getListsActive",
    "StatusListController.getListsActive"
  )
    .middleware("auth")
    .validator("StatusList/GetListsActive");
  Route.post("/statuslist/getList", "StatusListController.getList")
    .middleware("auth")
    .validator("StatusList/GetList");
  Route.post("/statuslist/createStatus", "StatusListController.createStatus")
    .middleware("auth")
    .validator("StatusList/CreateStatus");
  Route.post("/statuslist/updateStatus", "StatusListController.updateStatus")
    .middleware("auth")
    .validator("StatusList/UpdateStatus");

  //Transaction log routes
  Route.post("/transactionlog/getLogs", "TransactionLogController.getLogs")
    .middleware("auth")
    .validator("TransactionLog/GetLogs");

  //Transaction list routes
  Route.post(
    "/transactionlist/getTransactionList",
    "TransactionListController.getTransactionList"
  )
    .middleware("auth")
    .validator("TransactionList/GetTransactionList");
  Route.post(
    "/transactionlist/getTransaction",
    "TransactionListController.getTransaction"
  )
    .middleware("auth")
    .validator("TransactionList/GetTransaction");
  Route.post(
    "/transactionlist/getTransactionToday",
    "TransactionListController.getTransactionToday"
  )
    .middleware("auth")
    .validator("TransactionList/GetTransactionToday");

  //View PDF
  Route.get("/PDF/viewPDF/:hash/:type", "PdfController.viewPDF");

  //Reports routes
  Route.post(
    "/Report/generateOutwardTransactionReport",
    "ReportController.generateOutwardTransactionReport"
  )
    .middleware("auth")
    .validator("Report/GenerateOutwardTransactionReport");
  Route.post(
    "/Report/generateInwardTransactionReport",
    "ReportController.generateInwardTransactionReport"
  )
    .middleware("auth")
    .validator("Report/GenerateInwardTransactionReport");
  Route.post(
    "/Report/generateTransactionXLSX",
    "ReportController.generateTransactionXLSX"
  )
    .middleware("auth")
    .validator("Report/GenerateTransactionXLSX");
  Route.post(
    "/Report/generateTransactionPDF",
    "ReportController.generateTransactionPDF"
  )
    .middleware("auth")
    .validator("Report/GenerateTransactionPDF");
  Route.post(
    "/Report/generateTransactionPDFTable",
    "ReportController.generateTransactionPDFTable"
  )
    .middleware("auth")
    .validator("Report/GenerateTransactionPDFTable");

  Route.post(
    "/Report/generatePesonetReport",
    "ReportController.generatePesonetReport"
  )
    .middleware("auth")
    .validator("Report/GeneratePesonetReport");
  Route.post(
    "/Report/generatePesonetReportPDF",
    "ReportController.generatePesonetReportPDF"
  )
    .middleware("auth")
    .validator("Report/GeneratePesonetReportPDF");

  //Any url that does not exist.
  Route.any("*", ({ response }) => response.status(405).send());
})
  .prefix("api/v1")
  .middleware("api");

Route.any("*", ({ response }) => response.status(404).send());
