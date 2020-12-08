const readLines = require("../utils/readLines");

const group = (answers) => {
  const groups = [];
  let group = [];

  for (let i = 0, max = answers.length; i < max; i++) {
    if (answers[i] === "") {
      groups.push(group);
      group = [];
      continue;
    }

    group.push(answers[i]);
  }

  return [...groups, group];
};

const filterDistinctResponses = (group) =>
  group
    .join("")
    .split("")
    .filter((answer, index, answers) => answers.indexOf(answer) === index);

const countDistinctAnswers = (groups) =>
  groups
    .map(filterDistinctResponses)
    .reduce((answers, group) => answers + group.length, 0);

const filterCommonResponses = (group) =>
  group
    .map((s) => s.split(""))
    .reduce((commonAnswers, answers) =>
      commonAnswers.filter((answer) => answers.includes(answer))
    );

const countCommonAnswers = (groups) =>
  groups
    .map(filterCommonResponses)
    .reduce((answers, group) => answers + group.length, 0);

async function main() {
  const answers = await readLines(`${__dirname}/inputs.txt`);

  const groups = group(answers);
  const totalDistinctAnswers = countDistinctAnswers(groups);
  const totalCommonAnswers = countCommonAnswers(groups);

  console.log([totalDistinctAnswers, totalCommonAnswers]);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
