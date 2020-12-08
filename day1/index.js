const readLines = require("../utils/readLines");

async function main() {
  const inputContent = await readLines("./inputs.txt");

  const inputs = inputContent.map((value) => parseInt(value));

  for (let i = 0, max = inputs.length; i < max - 1; i++) {
    const a = inputs[i];

    for (let j = i + 1; j < max; j++) {
      const b = inputs[j];

      for (let k = j + 1; k < max; k++) {
        const c = inputs[k];
        if (a + b + c === 2020) {
          console.log(a * b * c);
        }
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
