const readLines = require("../utils/readLines");

const ruleRegex = /^(?<name>[^:]+): (?<l1>\d+)-(?<h1>\d+) or (?<l2>\d+)-(?<h2>\d+)$/;

const parseTicket = (ticket) => ticket.split(",").map((n) => parseInt(n));

const isWithinBounds = ({ value, low, high }) => low <= value && value <= high;

const parseLines = (lines) => {
  const rules = [];

  for (let i = 0; lines[i] !== ""; i++) {
    const { groups } = ruleRegex.exec(lines[i]);

    const { l1, h1, l2, h2 } = groups;
    const l1p = parseInt(l1);
    const h1p = parseInt(h1);
    const l2p = parseInt(l2);
    const h2p = parseInt(h2);

    rules.push({
      name: groups.name,
      isMatch: (value) =>
        isWithinBounds({ value, low: l1p, high: h1p }) ||
        isWithinBounds({ value, low: l2p, high: h2p }),
    });
  }

  const myTicketLabelIndex = lines.indexOf("your ticket:");
  const myTicket = parseTicket(lines[myTicketLabelIndex + 1]);

  const nearbyTicketsLabelIndex = lines.indexOf("nearby tickets:");

  const nearbyTickets = [];
  for (
    let i = nearbyTicketsLabelIndex + 1, max = lines.length;
    i < max && lines[i] !== "";
    i++
  ) {
    nearbyTickets.push(parseTicket(lines[i]));
  }

  return { rules, myTicket, nearbyTickets };
};

const isValueValid = ({ value, rules }) => {
  for (const rule of rules) {
    if (rule.isMatch(value)) {
      return true;
    }
  }

  return false;
};

const isTicketValid = ({ ticket, rules }) => {
  for (let i = 0, max = rules.length; i < max; i++) {
    if (!rules[i].isMatch(ticket[i])) {
      return false;
    }
  }

  return true;
};

const findValidRulesForValue = ({ value, rules }) =>
  rules.filter((r) => r.isMatch(value));

const findFieldsOrder = ({ myTicket, validTickets, rules }) => {
  let validRulesPerPosition = [];

  for (let i = 0, max = myTicket.length; i < max; i++) {
    let positionRules = findValidRulesForValue({ value: myTicket[i], rules });

    for (const ticket of validTickets) {
      positionRules = findValidRulesForValue({
        value: ticket[i],
        rules: positionRules,
      });
    }
    validRulesPerPosition.push({ cleaned: false, rules: positionRules });
  }

  while (
    validRulesPerPosition.some((set) => !set.cleaned && set.rules.length === 1)
  ) {
    const fixedPosition = validRulesPerPosition.find(
      (set) => !set.cleaned && set.rules.length === 1
    );

    const positionedRule = fixedPosition.rules[0].name;
    console.log(
      `Rule ${positionedRule} is positioned. cleaning other guesses.`
    );
    validRulesPerPosition.forEach((set) => {
      if (set === fixedPosition) {
        return;
      }
      set.rules = set.rules.filter((r) => r.name !== positionedRule);
    });

    fixedPosition.cleaned = true;
  }

  return validRulesPerPosition.flatMap((p) => p.rules.map((r) => r.name));
};

async function main() {
  const input = `${__dirname}/inputs.txt`;
  const lines = await readLines(input);
  const { rules, myTicket, nearbyTickets } = parseLines(lines);

  const scanningErrorRate = nearbyTickets
    .flat()
    .filter((value) => !isValueValid({ value, rules }))
    .reduce((acc, value) => acc + value, 0);

  const validTickets = nearbyTickets.filter((t) =>
    t.every((value) => isValueValid({ value, rules }))
  );
  const orderedFields = findFieldsOrder({ myTicket, validTickets, rules });

  const myTicketObject = Object.fromEntries(
    orderedFields.map((field, index) => [field, myTicket[index]])
  );
  const myTicketProduct = orderedFields
    .map((name, index) => [name, index])
    .filter(([name]) => name.indexOf("departure") > -1)
    .map(([_, index]) => myTicket[index])
    .reduce((acc, value) => acc * value, 1);

  console.log({
    scanningErrorRate,
    orderedFields,
    myTicketObject,
    myTicketProduct,
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
