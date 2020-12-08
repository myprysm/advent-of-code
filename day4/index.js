const readLines = require("../utils/readLines");

const between = (min, max) => (value) => {
  if (!value.match(/\d+/)) {
    return false;
  }
  const number = parseInt(value);
  return min <= number && number <= max;
};

const pattern = (regex) => (value) => value.match(regex);

const includedIn = (list) => (value) => list.includes(value);

const match = (pattern) => (value) => {
  const [m] = Object.keys(pattern).filter((p) => value.includes(p));

  return m && pattern[m](value.replace(m, ""));
};

const fields = [
  ["byr", between(1920, 2002)],
  ["iyr", between(2010, 2020)],
  ["eyr", between(2020, 2030)],
  ["hgt", match({ cm: between(150, 193), in: between(59, 76) })],
  ["hcl", pattern(/#[0-9a-f]{6}/g)],
  ["ecl", includedIn(["amb", "blu", "brn", "gry", "grn", "hzl", "oth"])],
  ["pid", pattern(/^\d{9}$/g)],
]; //, "cid"];

const createPassportObject = (passportString) =>
  passportString
    .split(" ")
    .map((field) => field.split(":"))
    .reduce(
      (acc, [field, value]) => ({
        ...acc,
        [field]: value,
      }),
      {}
    );

const isPassportValid = (passport) => {
  const props = Object.keys(passport);

  return fields.reduce((valid, [field, validate]) => {
    if (!(valid && props.includes(field))) {
      return false;
    }

    const isFieldValid = validate(passport[field]);
    console.log(
      `${field} ${isFieldValid ? "valid" : "invalid"}: ${passport[field]}`
    );

    return isFieldValid;
  }, true);
};

async function main() {
  const matrix = await readLines(`${__dirname}/inputs.txt`);

  let currentPassportData = [],
    validPassports = 0;
  for (let i = 0, max = matrix.length; i < max; i++) {
    currentPassportData.push(matrix[i]);
    if (matrix[i] === "" || i === max - 1) {
      const passport = createPassportObject(currentPassportData.join(" "));

      if (isPassportValid(passport)) {
        validPassports++;
      }

      currentPassportData = [];
    }
  }

  console.log(validPassports);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
