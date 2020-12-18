const readLines = require("../utils/readLines");

const groupRegex = /\(([^()]+)\)/;
const operationRegex = /(\d+) ([*+]) (\d+)/;
const additionRegex = /(\d+) \+ (\d+)/;
const productRegex = /(\d+) \* (\d+)/;

const replaceAll = (string, regex, replacer) => {
  let match;
  let subject = string;
  while ((match = subject.match(regex)) !== null) {
    subject = subject.replace(match[0], replacer(match));
  }

  return subject;
};

const calculateWithPrecedence = (input, operations) => {
  const flatOperation = replaceAll(input, groupRegex, (match) =>
    calculateWithPrecedence(match[1], operations)
  );

  const result = operations.reduce(
    (subject, operation) =>
      replaceAll(subject, operation, (match) => eval(match[0])),
    flatOperation
  );

  return parseInt(result);
};

async function main() {
  const input = `${__dirname}/inputs.txt`;
  const operations = await readLines(input);

  const results = operations
    .filter((op) => op !== "")
    .map((operation) => [
      operation,
      [
        calculateWithPrecedence(operation, [operationRegex]),
        calculateWithPrecedence(operation, [additionRegex, productRegex]),
      ],
    ]);
  const sum = results.reduce((acc, [_, result]) => acc + result[0], 0);
  const sumWitPrecedence = results.reduce(
    (acc, [_, result]) => acc + result[1],
    0
  );

  console.log({ results: new Map(results), sum, sumWitPrecedence });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
