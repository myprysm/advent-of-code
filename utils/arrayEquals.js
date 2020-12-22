const arrayEquals = ({ left, right, reverse = false }) => {
  if ((!left && right) || (!right && left)) {
    return false;
  }
  if (left.length !== right.length) {
    return false;
  }

  const getRightIndex = reverse ? (i, max) => max - i : (i) => i;

  for (let i = 0, max = left.length - 1; i <= max; i++) {
    if (left[i] !== right[getRightIndex(i, max)]) {
      return false;
    }
  }
  return true;
};

module.exports = arrayEquals;
