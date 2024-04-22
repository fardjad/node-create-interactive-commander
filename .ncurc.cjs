module.exports = {
  target: (name) => {
    if (["eslint"].includes(name)) {
      return "minor";
    }

    return "latest";
  },
  deep: true,
};
