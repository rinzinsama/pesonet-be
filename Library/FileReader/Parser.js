class Parser {
  static getDates(dates) {
    return [
      ...dates.matchAll(/Print Date : (\d{2}\/\d{2}\/\d{4})/g),
    ].map((date) => date[1].trim());
  }

  static getSenderNames(names) {
    return [...names.matchAll(/Ordering Customer : (.*)/g)].map((name) =>
      name[1].trim()
    );
  }

  static getCurrency(currencies) {
    return [
      ...currencies.matchAll(/Foreign Currency : (.*)/g),
    ].map((currency) => currency[1].trim());
  }

  static getAmounts(amounts) {
    return [
      ...amounts.matchAll(/Foreign Currency Amount : (.*) F/g),
    ].map((amount) => amount[1].trim().replace(/,/g, ""));
  }

  static getAccountNumbers(numbers) {
    return [...numbers.matchAll(/Beneficiary Customer A\/c No.: (\d*)/g)].map(
      (number) => {
        const acctNumber = number[1].trim();
        return acctNumber.substr(acctNumber.length - 6);
      }
    );
  }

  static getNotes(notes) {
    const externalReference = [
      ...notes.matchAll(/External Reference : (.*)/g),
    ].map((reference) => reference[1].trim());

    const banks = [...notes.matchAll(/Bank Name : (.*)/g)]
      .filter((bank, i) => i % 2 == 0)
      .map((bank) => bank[1].trim());

    const detailsOfPayment = [
      ...notes.matchAll(/Details Of Payment : (.*[\s\S]*?)(?=Completion)/g),
    ].map((detail) => detail[1].trim().replace(/\n|\r/g, ""));

    return externalReference.map((ref, i) => {
      return `${ref} /${banks[i]}/${detailsOfPayment[i]}`;
    });
  }

  static getMaker(makers) {
    return [...makers.matchAll(/Maker : (.*)/g)].map((maker) =>
      maker[1].trim()
    );
  }

  static getChecker(checkers) {
    return [...checkers.matchAll(/Checker : (.*)/g)].map((checker) =>
      checker[1].trim()
    );
  }

  static getReference(references) {
    return [
      ...references.matchAll(
        /Beneficiary Customer A\/c No.: .*([\s\S]*?)(?:Beneficiary Customer Name and Address : )(.*)/g
      ),
    ].map((reference) => {
      const tailRack = reference[1].trim().split(/\n|\r/g).filter(Boolean);
      const tail = tailRack.reverse().map((tail) => tail.trim());
      return `${reference[2].trim()} ${tail.join(" ")}`;
    });
  }
}

module.exports = Parser;