const BOOKS = {
  0: [
    "https://m.media-amazon.com/images/I/51jBeCDwMQL.jpg",
    "https://images.squarespace-cdn.com/content/v1/543d370ee4b0dc74d0f2af1f/1486714579875-6DKPHQ5QL44R9FJE9CF6/powerofnow.jpg",
    "https://images-na.ssl-images-amazon.com/images/I/71oOilNesPL.jpg",
  ],
  1: [
    "https://images-na.ssl-images-amazon.com/images/I/81Kr+YIWjCL.jpg",
    "https://broadviewpress.com/wp-content/uploads/2019/11/9781554812851.jpg",
    "https://pup-assets.imgix.net/onix/images/9780691133928.jpg",
  ],
  2: [
    "https://d3nuqriibqh3vw.cloudfront.net/styles/aotw_detail_ir/s3/images/northernPhysics.jpg",
    "https://www.basicbooks.com/wp-content/uploads/2017/09/97804650252751.jpg",
    "http://prodimage.images-bn.com/pimages/9789388118125_p0_v2_s1200x630.jpg",
  ],
};
const BOOK_TYPES = ["spiritual", "philosophical", "physics"];
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
console.log(ALL_UIOPTIONS);

const OPTION_TYPES = Object.keys(ALL_UIOPTIONS).map(function (key, index) {
  return `uioption - ${key}`;
});
export { COLORS, BOOKS, BOOK_TYPES, ALL_UIOPTIONS, OPTION_TYPES };
