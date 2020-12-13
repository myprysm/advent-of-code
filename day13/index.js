const readLines = require("../utils/readLines");

const closestLineFromAvailability = ({ schedules, availableIn }) =>
  schedules
    .split(",")
    .filter((line) => line !== "x")
    .map((line) => parseInt(line))
    .map((line) => [line, Math.ceil(availableIn / line) * line - availableIn])
    .reduce(
      ([shortestWaitingLine, shortestWaitingTime], [line, waitingTime]) =>
        shortestWaitingTime < waitingTime
          ? [shortestWaitingLine, shortestWaitingTime]
          : [line, waitingTime],
      [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
    );

const isDelayedAccordingly = ({ line: { line, delay }, timestamp }) =>
  (timestamp + delay) % line === 0;

const findTimestamp = (schedules) => {
  const [reference, ...otherLines] = schedules
    .split(",")
    .map((line, delay) => ({ line, delay }))
    .filter(({ line }) => line !== "x")
    .map(({ line, delay }) => ({ line: parseInt(line), delay }));

  return otherLines.reduce(
    ([timestamp, increment], line) => {
      do timestamp += increment;
      while (!isDelayedAccordingly({ line, timestamp }));
      return [timestamp, increment * line.line];
    },
    [0, reference.line]
  );
};

async function main() {
  const input = `${__dirname}/inputs.txt`;
  const [rawAvailableIn, schedules] = await readLines(input);
  const availableIn = parseInt(rawAvailableIn);

  const closestLineInput = { schedules, availableIn };
  const [line, waitTime] = closestLineFromAvailability(closestLineInput);

  const [timestamp] = findTimestamp(schedules);

  const weirdProduct = line * waitTime;
  console.log({ line, waitTime, weirdProduct, timestamp });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
