// All possible UI options
const ALL_UIOPTIONS = [
  ["black", "gradient"], // heroBackground
  ["hero", "vision"], // buttonPosition
  ["arrow", "user", "code"], // buttonIcon
  ["blue", "white"], // buttonColor
]
  .reduce((a, b) =>
    a.reduce((r, v) => r.concat(b.map((w) => [].concat(v, w))), [])
  )
  .map(([heroBackground, buttonPosition, buttonIcon, buttonColor]) => ({
    heroBackground,
    buttonPosition,
    buttonIcon,
    buttonColor,
  }));

// Generate option labels for plot
const OPTION_TYPES = Object.keys(ALL_UIOPTIONS).map(function (key, index) {
  return `uioption - ${key}`;
});

export { ALL_UIOPTIONS, OPTION_TYPES };
