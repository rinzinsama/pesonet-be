"use strict";
const Drive = use("Drive");
const Helpers = use("Helpers");
const { to } = use("await-to-js");
const crypto = use("crypto");
const got = use("got");
const Logger = use("Logger");
const moment = use("moment");
const ApiTransaction = use("App/Models/ApiTransaction");
const Env = use("Env");

const { HttpsProxyAgent, HttpProxyAgent } = require("hpagent");

class Service {
  constructor(sentBy, path, concat = null, method = "get") {
    this.path = path;
    this.concat = concat;
    this.method = method;
    this.sentBy = sentBy;
  }

  async getCredentials() {
    const credentials = await Drive.get(
      Helpers.tmpPath("api/credentials.json")
    );

    return JSON.parse(credentials.toString());
  }

  async checkCertificate() {
    let credsExists = false;

    const isPem = await Drive.exists(
      Helpers.tmpPath("api/certificate/pesonet.pem")
    );

    if (isPem) {
      const keyExists = await Drive.exists(
        Helpers.tmpPath("api/certificate/pesonet.key")
      );

      const certExists = await Drive.exists(
        Helpers.tmpPath("api/certificate/pesonet.crt")
      );

      credsExists = keyExists && certExists ? true : false;
    } else {
      const p12Exists = await Drive.exists(
        Helpers.tmpPath("api/certificate/pesonet.p12")
      );

      credsExists = p12Exists ? true : false;
    }

    return credsExists;
  }

  async getCertificates() {
    let auth = {};

    const isPem = await Drive.exists(
      Helpers.tmpPath("api/certificate/pesonet.pem")
    );

    if (isPem) {
      const key = await Drive.get(
        Helpers.tmpPath("api/certificate/pesonet.key")
      );
      const cert = await Drive.get(
        Helpers.tmpPath("api/certificate/pesonet.crt")
      );

      auth = {
        cert,
        key,
        type: "pem",
      };
    } else {
      const pfx = await Drive.get(
        Helpers.tmpPath("api/certificate/pesonet.p12")
      );

      auth = {
        pfx,
        type: "pfx",
      };
    }

    return auth;
  }

  isJson(data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }

  async send(postBody = null) {
    let response = {};

    const {
      url,
      path,
      passphrase,
      apiKey,
      secretKey,
    } = await this.getCredentials();

    const composeSignature = `${apiKey}${secretKey}${this.concat || ""}`;
    const signature = crypto
      .createHash("sha256")
      .update(composeSignature)
      .digest("hex");

    const isValid = await this.checkCertificate();
    const headers = {
      "Content-Type": "application/json",
      api_key: apiKey,
      signature,
    };

    const hasProxy = +Env.get("HAS_PROXY");
    let agent = {};

    if (hasProxy) {
      const proxyType = Env.get("PROXY_TYPE");
      const proxy_host = Env.get("PROXY_HOST");

      if (proxyType == "http") {
        const http = new HttpProxyAgent({
          keepAlive: true,
          keepAliveMsecs: 1000,
          maxSockets: 256,
          maxFreeSockets: 256,
          scheduling: "lifo",
          proxy: proxy_host,
        });

        agent = { http };
      } else {
        const https = new HttpsProxyAgent({
          keepAlive: true,
          keepAliveMsecs: 1000,
          maxSockets: 256,
          maxFreeSockets: 256,
          scheduling: "lifo",
          proxy: proxy_host,
        });

        agent = { https };
      }
    }

    if (isValid) {
      const { type: certType, ...certs } = await this.getCertificates();

      const options = {
        prefixUrl: `${url}/${path}`,
        passphrase,
        headers,
        secureProtocol: "TLSv1_2_method",
        retry: 0,
        methodRewriting: false,
        timeout: 300000,
      };

      if (certType == "pem") {
        options.key = certs.key;
        options.cert = certs.cert;
      } else options.pfx = certs.pfx;

      if (hasProxy) options.agent = agent;
      if (this.method != "get") options.body = JSON.stringify(postBody);

      const client = got.extend(options);

      const [err, data] =
        this.method == "get"
          ? await this.sendAsGet(client)
          : await this.sendAsPost(client);

      const responseBody = err
        ? err.response && err.response.body
          ? err.response.body
          : null
        : data.body;

      const status = err ? 500 : 200;
      const body =
        responseBody && typeof responseBody != "object"
          ? this.isJson(responseBody)
          : {};

      const message = err
        ? body && body.error && body.error.message
          ? body.error.message
          : "Request failed."
        : "Request successful.";

      const responseStatus = err
        ? err.response && err.response.statusCode
          ? err.response.statusCode
          : null
        : data.statusCode;

      const apiTransaction = new ApiTransaction();
      apiTransaction.merge({
        sent_by: this.sentBy,
        endpoint: `${url}/${path}/${this.path}`,
        log: message,
      });

      await apiTransaction.save();

      Logger.transport("pesonet_api").info({
        timestamp: moment().format("MMMM D, YYYY - h:mm:ss A"),
        referenceId: apiTransaction.reference_id,
        endpoint: `${url}/${path}/${this.path}`,
        request: postBody,
        response: body,
        header: headers,
        method: this.method,
        sentBy: this.sentBy,
        stackTrace: err ? err.stack.replace(/\n\s+/gm, " ") : null,
      });

      response = {
        status,
        message,
        data: body,
        responseStatus,
      };
    } else
      response = {
        status: 500,
        message: "No api credentials found.",
        data: null,
        responseStatus: null,
      };

    return response;
  }

  async sendAsPost(client) {
    return await to(client.post(this.path));
  }

  async sendAsGet(client) {
    return await to(client.get(this.path));
  }
}

module.exports = Service;
