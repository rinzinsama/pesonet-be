const { hooks } = use("@adonisjs/ignitor");
const { ioc } = use("@adonisjs/fold");

hooks.after.providersBooted(() => {
  const Socket = use("Library/Socket/Singleton");
  const FileReader = use("Library/FileReader/Singleton");

  ioc.singleton("Socket", (app) => new Socket());
  ioc.singleton("FileReader", (app) => new FileReader());

  const ValidatorHooks = use("Start/hooks/Validator");
  const SanitizorHooks = use("Start/hooks/Sanitizor");
  const Validator = use("Validator");

  for (const key in ValidatorHooks) {
    Validator.extend(key, ValidatorHooks[key]);
  }

  for (const key in SanitizorHooks) {
    Validator.sanitizor[key] = SanitizorHooks[key];
  }
});

// hooks.before.httpServer(async () => {
//   const FileReader = use("FileReader");
//   await FileReader.init();
// });
