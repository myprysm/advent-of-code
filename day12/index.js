const readLines = require("../utils/readLines");

const rotateVector = ({ x, y, angle }) => {
  const radians = -angle * (Math.PI / 180);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    x: Math.round(x * cos - y * sin),
    y: Math.round(x * sin + y * cos),
  };
};

const calculateMove = ({ action, value, waypoint }) => {
  if (action === "F") {
    return { x: value * waypoint.x, y: value * waypoint.y, waypoint };
  }

  switch (action) {
    case "L":
      return {
        x: 0,
        y: 0,
        waypoint: rotateVector({ ...waypoint, angle: -value }),
      };
    case "R":
      return {
        x: 0,
        y: 0,
        waypoint: rotateVector({ ...waypoint, angle: value }),
      };
  }

  switch (action) {
    case "N":
      return { x: 0, y: 0, waypoint: { ...waypoint, y: waypoint.y + value } };
    case "S":
      return { x: 0, y: 0, waypoint: { ...waypoint, y: waypoint.y - value } };
    case "E":
      return { x: 0, y: 0, waypoint: { ...waypoint, x: waypoint.x + value } };
    case "W":
      return { x: 0, y: 0, waypoint: { ...waypoint, x: waypoint.x - value } };
  }
};

const followInstruction = ({ instruction, position }) => {
  const { action, value } = instruction;

  const { x, y, waypoint } = calculateMove({
    action,
    value,
    waypoint: position.waypoint,
  });

  return { x: position.x + x, y: position.y + y, waypoint };
};

const moveAccordingToInstructions = ({ instructions, start, waypoint }) => {
  let position = { ...start, waypoint };
  for (const instruction of instructions) {
    position = followInstruction({ instruction, position });
  }

  return position;
};

const readInstruction = (instruction) => ({
  action: instruction.substr(0, 1),
  value: parseInt(instruction.substr(1)),
});

async function main() {
  const rawInstructions = await readLines(`${__dirname}/inputs.txt`);
  const instructions = rawInstructions
    .filter((i) => i.length)
    .map(readInstruction);

  const start = { x: 0, y: 0 };
  const waypoint = { x: 10, y: 1 };
  const initialState = { instructions, start, waypoint };
  const { x, y } = moveAccordingToInstructions(initialState);

  console.log({ x, y, manhattan: Math.abs(x) + Math.abs(y) });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
