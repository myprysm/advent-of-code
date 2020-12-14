const readLines = require("../utils/readLines");

const defaultMask = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const assignmentRegex = /mem\[(?<position>\d+)] = (?<value>\d+)/;
const parseInstruction = (instruction) => {
  if (instruction.includes("mask")) {
    return { type: "mask", value: instruction.replace("mask = ", "") };
  }

  const { groups } = assignmentRegex.exec(instruction);
  return {
    type: "assignment",
    position: parseInt(groups.position).toString(2).padStart(36, "0"),
    value: parseInt(groups.value).toString(2).padStart(36, "0"),
  };
};

const applyMaskV1 = ({ mask, value }) => {
  let newValue = "";
  for (let i = 0, max = mask.length; i < max; i++) {
    const char = mask.charAt(i);
    newValue += char === "X" ? value.charAt(i) : char;
  }

  return newValue;
};

const executeV1 = (instructions) =>
  instructions.reduce(
    ([mask, registry], { type, ...instruction }) => {
      if (type === "mask") {
        return [instruction.value, registry];
      }

      const value = applyMaskV1({ mask, value: instruction.value });
      return [mask, { ...registry, [instruction.position]: value }];
    },
    [defaultMask, {}]
  )[1];

const applyMaskV2 = ({ mask, value }) => {
  let newValue = "";
  for (let i = 0, max = mask.length; i < max; i++) {
    const char = mask.charAt(i);
    if (char === "X") {
      newValue += char;
      continue;
    }

    newValue += char === "0" ? value.charAt(i) : char;
  }

  return newValue;
};

const generateAddresses = (floatingAddress) =>
  floatingAddress
    .split("")
    .reduce(
      (addresses, bit) =>
        bit === "X"
          ? addresses.flatMap((a) => [`${a}1`, `${a}0`])
          : addresses.map((a) => `${a}${bit}`),
      [""]
    );

const executeV2 = (instructions) => {
  const registry = {};
  let mask = defaultMask;

  for (let i = 0, iMax = instructions.length; i < iMax; i++) {
    const instruction = instructions[i];

    if (instruction.type === "mask") {
      mask = instruction.value;
      continue;
    }

    const floatingAddress = applyMaskV2({
      mask,
      value: instruction.position,
    });
    const addresses = generateAddresses(floatingAddress);
    for (const address of addresses) {
      registry[address] = instruction.value;
    }
  }

  return registry;
};

const sumAddressedValues = (registry) =>
  Object.values(registry)
    .map((value) => parseInt(value, 2))
    .reduce((acc, value) => acc + value, 0);

async function main() {
  const input = `${__dirname}/inputs.txt`;
  const rawInstructions = await readLines(input);
  const instructions = rawInstructions
    .filter((i) => i.length)
    .map(parseInstruction);

  const registryV1 = executeV1(instructions);
  const sumOfAddressedValuesV1 = sumAddressedValues(registryV1);

  const registryV2 = executeV2(instructions);
  const sumOfAddressedValuesV2 = sumAddressedValues(registryV2);

  console.log({
    sumOfAddressedValuesV1,
    sumOfAddressedValuesV2,
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
