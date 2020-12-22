const readLines = require("../utils/readLines");

const processFood = (food) => {
  const [ingredients, allergens] = food.split(" (contains ");

  return {
    ingredients: ingredients.split(" "),
    allergens: allergens.substring(0, allergens.length - 1).split(", "),
  };
};

const shouldCleanAllergen = (list) =>
  !list.cleaned && list.ingredients.length === 1;
const findAllergens = ({ allergens, foods }) => {
  const allergenMap = new Map(allergens.map((a) => [a, []]));
  for (const allergen of allergens) {
    for (const food of foods) {
      if (food.allergens.includes(allergen)) {
        const currentSuspects = allergenMap.get(allergen);
        const suspects = currentSuspects.length
          ? food.ingredients.filter((i) => currentSuspects.includes(i))
          : food.ingredients;

        allergenMap.set(allergen, suspects);
      }
    }
  }

  const allergenList = [
    ...allergenMap.entries(),
  ].map(([kind, ingredients]) => ({ kind, ingredients, cleaned: false }));

  while (allergenList.some(shouldCleanAllergen)) {
    const toClean = allergenList.find(shouldCleanAllergen);

    allergenList.forEach((list) => {
      if (list === toClean) {
        return;
      }

      list.ingredients = list.ingredients.filter(
        (i) => !toClean.ingredients.includes(i)
      );
      toClean.cleaned = true;
    });
  }

  return allergenList;
};

async function main() {
  const input = `${__dirname}/inputs.txt`;
  const foods = await readLines(input);

  const processedFoods = foods.filter((food) => food.length).map(processFood);
  const allergens = processedFoods
    .flatMap((f) => f.allergens)
    .filter((allergen, i, a) => a.indexOf(allergen) === i);

  const allergenIngredients = findAllergens({
    allergens,
    foods: processedFoods,
  });

  const numberOfIngredientsWithoutAllergens = processedFoods.reduce(
    (acc, food) => {
      const ingredients = food.ingredients.filter(
        (i) => !allergenIngredients.some((a) => a.ingredients.includes(i))
      );

      return acc + ingredients.length;
    },
    0
  );

  const sortedAllergens = allergenIngredients.sort((a, b) =>
    a.kind.localeCompare(b.kind)
  );
  const allergenIngredientsPerAllergen = sortedAllergens
    .map((a) => a.ingredients.join(","))
    .join(",");
  console.log({
    numberOfIngredientsWithoutAllergens,
    allergenIngredientsPerAllergen,
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
