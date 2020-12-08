const readLines = require("../utils/readLines");

const opRegex = /(?<name>(?:acc|jmp|nop)) (?<value>[+-]\d+)/;
const parseOperation = (op) => {
  const {
    groups: { name, value },
  } = opRegex.exec(op);

  return { name, value: parseInt(value), executions: 0 };
};

const accumulateTillInfiniteLoop = (operations) => {
  const ops = operations.map((op) => ({ ...op }));
  let value = 0,
    rc = 0;

  for (let i = 0, max = ops.length; ; ) {
    const op = ops[i];

    if (i >= max) {
      break;
    }

    if (op.executions) {
      rc = 1;
      break;
    }

    i++;

    if (op.name === "acc") {
      value += op.value;
    } else if (op.name === "jmp") {
      i += op.value - 1;
    }

    op.executions++;
  }

  return { value, rc };
};

const findAccumulatorHappyPath = (operations) => {
  for (let i = 0, max = operations.length; i < max; i++) {
    const { name, value } = operations[i];

    if (name === "acc") {
      continue;
    }

    const newOpName = name === "nop" ? "jmp" : "nop";
    const newOp = { name: newOpName, value, executions: 0 };
    const newOpSet = operations.map((op, index) => (index === i ? newOp : op));

    const result = accumulateTillInfiniteLoop(newOpSet);

    if (result.rc === 0) {
      return result;
    }
  }

  return { value: -1, rc: -1 };
};

async function main() {
  const rawOperations = await readLines(`${__dirname}/inputs.txt`);
  const operations = rawOperations.map(parseOperation);
  const accumulated = accumulateTillInfiniteLoop(operations);
  const happyPath = findAccumulatorHappyPath(operations);

  console.log([accumulated, happyPath]);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
