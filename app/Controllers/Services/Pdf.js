"use strict";
const Drive = use("Drive");
const Helpers = use("Helpers");
const Encryption = use("Encryption");

class PdfService {
  static async viewPDF(params) {
    const { hash, type } = params;

    let loc = "";
    const uriComponent = decodeURIComponent(type);

    if (uriComponent == "Outward Message") loc = "outward";
    else if (uriComponent == "Inward Message") loc = "inward";
    else if (uriComponent == "Grouped Inward Message") loc = "inward_group";
    else loc = "report";

    const unHash = Buffer.from(hash, "base64").toString("ascii");
    const decrypted = Encryption.decrypt(unHash);

    const path =
      uriComponent == "Outward Message" || uriComponent == "Inward Message"
        ? `pdf/${loc}/${decrypted}.pdf`
        : `pdf/${loc}/${decrypted}`;

    const pdf = await Drive.get(Helpers.tmpPath(path));

    return pdf;
  }
}

module.exports = PdfService;
