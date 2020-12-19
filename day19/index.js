const readLines = require("../utils/readLines");

const ruleRegex = /^(?<rule>\d+): (?<expression>.*)/;

const messageRegex = /^[ab]+/;

const parseExpression = (expression) =>
  expression.split(" | ").map((branch) => branch.split(" "));

const isValid = ({ rules, message, ruleset = [] }) => {
  const [rule, ...rest] = ruleset;

  if (!rule) {
    return !message;
  }

  const next = rules.get(rule);

  if (next instanceof Array) {
    return next.some((set) =>
      isValid({ rules, message, ruleset: [...set, ...rest] })
    );
  }

  return (
    message[0] === next &&
    isValid({ rules, message: message.slice(1), ruleset: rest })
  );
};

const processInput = (input) => {
  const rules = new Map();

  let matchingMessages = 0;
  for (const line of input) {
    let match;
    if ((match = line.match(ruleRegex)) !== null) {
      const { rule, expression } = match.groups;
      const value =
        expression[0] === '"' ? expression[1] : parseExpression(expression);
      rules.set(rule, value);
      continue;
    }

    if (
      (match = line.match(messageRegex)) !== null &&
      isValid({ rules, message: line, ruleset: ["0"] })
    ) {
      matchingMessages++;
    }
  }

  return matchingMessages;
};

async function main() {
  const input = `${__dirname}/inputs.txt`;
  const lines = await readLines(input);
  const messagesMatchingRules = processInput(lines);

  console.log({ messagesMatchingRules });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
