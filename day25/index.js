const transform = ({ value, subject, salt }) => {
  value *= subject;
  value %= salt;
  return value;
};

const findLoopSize = ({ subject, publicKey, salt }) => {
  let loopSize = 0;
  let value = 1;

  do {
    loopSize++;
    value = transform({ value, subject, salt });
  } while (value !== publicKey);

  return loopSize;
};

const applyTransform = ({ subject, salt, times }) => {
  let value = 1;
  for (let i = 0; i < times; i++) {
    value = transform({ value, subject, salt });
  }

  return value;
};

const findEncryptionKey = ({ subject, salt, keys }) => {
  const [doorKey, cardKey] = keys;
  const [doorLoop, cardLoop] = keys.map((publicKey) =>
    findLoopSize({ subject, publicKey, salt })
  );

  const cardEncryptionKey = applyTransform({
    subject: cardKey,
    times: doorLoop,
    salt,
  });
  const doorEncryptionKey = applyTransform({
    subject: doorKey,
    times: cardLoop,
    salt,
  });

  return { doorLoop, cardLoop, cardEncryptionKey, doorEncryptionKey };
};

async function main() {
  const testInputs = [5764801, 17807724];
  const inputs = [5099500, 7648211];
  const subject = 7;
  const salt = 20201227;

  const testLoops = findEncryptionKey({ subject, salt, keys: testInputs });
  const loops = findEncryptionKey({ subject, salt, keys: inputs });
  console.log({
    testLoops,
    loops,
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
