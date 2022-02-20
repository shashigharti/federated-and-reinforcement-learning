const COLORS = {
  0: "red",
  1: "antiquewhite",
  2: "aqua",
  3: "aquamarine",
  4: "lavenderblush",
  5: "fuchsia",
  6: "darkkhaki",
  7: "darksalmon",
  8: "darkseagreen",
  9: "lightblue",
  10: "lightskyblue",
  11: "lightyellow",
  12: "pink",
  13: "lightsteelblue",
  14: "mintcream",
  15: "lightseagreen",
  16: "greenyellow",
  17: "green",
  18: "realiceblued",
  19: "lightslategray",
  20: "palevioletred",
  21: "springgreen",
  22: "blue",
  23: "teal",
  24: "lightgoldenrodyellow",
};

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

export { COLORS, ALL_UIOPTIONS, OPTION_TYPES };
