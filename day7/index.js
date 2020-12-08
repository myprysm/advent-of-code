const readLines = require("../utils/readLines");

const parseBag = (bag) => {
  const [color, rest] = bag.split(" bags contain ");

  const contained = rest
    .split(/s?, /)
    .map((c) => c.replace(/ bags?.?/, "").split(" "))
    .map(([quantity, ...containedType]) => ({
      quantity: parseInt(quantity),
      type: containedType.join(" "),
    }))
    .filter(({ type }) => type !== "other");

  return { color, contained };
};

const findParents = (type, bags) => {
  const containers = bags.filter(({ contained }) =>
    contained.some((c) => c.type === type)
  );

  const parentContainers = containers.flatMap(({ color }) =>
    findParents(color, bags)
  );

  return [...containers, ...parentContainers].filter(
    (c, index, array) => array.findIndex((i) => i.color === c.color) === index
  );
};

const weightChildren = (type, bags) => {
  const bag = bags.find((b) => b.color === type);

  return !bag
    ? 0
    : bag.contained.reduce(
        (weight, { quantity, type: color }) =>
          weight + quantity + quantity * weightChildren(color, bags),
        0
      );
};

async function main() {
  const rawBags = await readLines(`${__dirname}/inputs.txt`);
  const type = "shiny gold";

  const bags = rawBags.map(parseBag);
  const parents = findParents(type, bags);
  const childWeight = weightChildren(type, bags);
  console.log([parents.length, childWeight]);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
