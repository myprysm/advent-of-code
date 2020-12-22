const readFile = require("../utils/readFile");

const readDecks = (decks) =>
  decks
    .split("\n\n")
    .filter((d) => d.length)
    .map((deck) =>
      deck
        .split("\n")
        .filter((c) => c.length)
        .slice(1)
        .map((card) => parseInt(card))
    );

const classicCombat = ({ player1, player2 }) => {
  const [deck1, deck2] = [[...player1], [...player2]];
  let turns = 0;
  while (deck1.length && deck2.length) {
    const card1 = deck1.shift();
    const card2 = deck2.shift();

    if (card1 < card2) {
      deck2.push(card2);
      deck2.push(card1);
    } else {
      deck1.push(card1);
      deck1.push(card2);
    }
    turns++;
  }

  const winner = deck1.length ? "player1" : "player2";
  const finalDeck = deck1.length ? deck1 : deck2;
  return { winner, finalDeck, turns };
};

const recursiveCombat = ({ player1, player2 }) => {
  const [deck1, deck2] = [[...player1], [...player2]];
  let turns = [];
  while (deck1.length && deck2.length) {
    const card1 = deck1.shift();
    const card2 = deck2.shift();

    if (deck1.length >= card1 && deck2.length >= card2) {
      const { winner } = recursiveCombat({
        player1: deck1.slice(0, card1),
        player2: deck2.slice(0, card2),
      });

      if (winner === "player1") {
        deck1.push(card1);
        deck1.push(card2);
      } else {
        deck2.push(card2);
        deck2.push(card1);
      }
    } else {
      if (card1 < card2) {
        deck2.push(card2);
        deck2.push(card1);
      } else {
        deck1.push(card1);
        deck1.push(card2);
      }
    }

    // Check that turn has not been played yet
    const turn = `${deck1.join(",")}|${deck2.join(",")}`;
    if (turns.includes(turn)) {
      return {
        winner: "player1",
        finalDeck: deck1.concat(deck2),
        turns: turns.length,
      };
    }

    turns.push(turn);
  }

  const winner = deck1.length ? "player1" : "player2";
  const finalDeck = deck1.length ? deck1 : deck2;
  return { winner, finalDeck, turns: turns.length };
};

const calculateScore = (deck) =>
  deck.reduce(
    ([score, multiplier], card) => [score + card * multiplier, multiplier - 1],
    [0, deck.length]
  )[0];

const playGame = ({ player1, player2, game }) => {
  const { winner, finalDeck, turns } = game({ player1, player2 });
  const score = calculateScore(finalDeck);
  console.log({ player1, player2, winner, finalDeck, turns, score });
};

async function main() {
  const input = `${__dirname}/inputs.txt`;
  const rawDecks = await readFile(input);
  const [player1, player2] = readDecks(rawDecks);
  playGame({ player1, player2, game: classicCombat });
  playGame({ player1, player2, game: recursiveCombat });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
