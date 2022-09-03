import { BOOKS, BOOK_TYPES } from "./bookclient";
import { ALL_UIOPTIONS, OPTION_TYPES } from "./uiclient";
import { WEB_OPTIONS } from "./webclient";

const COLORS = {
  0: "red",
  1: "blue",
  2: "aqua",
  3: "aquamarine",
  4: "green",
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
  17: "lavenderblush",
  18: "realiceblued",
  19: "lightslategray",
  20: "palevioletred",
  21: "springgreen",
  22: "antiquewhite",
  23: "teal",
  24: "lightgoldenrodyellow",
};

const META_DATA = {
  1: {
    base_url: "book-client",
    no_of_clients: 3,
    dim: 3,
    description: "Book Client; No preference change",
    has_nested_route: "false",
    model_name: "example_1",
  },
  2: {
    base_url: "ui-client",
    no_of_clients: 1,
    dim: 24,
    model_name: "example_2",
    description: "Single client; No preference change",
    has_nested_route: "true",
    change_policy: false,
    change_prob_idxs: { 0: [0] }, // indexes for probability value change
    change_probs: { 0: [0.7] }, // probability value for different indexes given by change_prob_idxs
  },
  3: {
    base_url: "ui-client",
    no_of_clients: 1,
    dim: 24,
    model_name: "example_3",
    description: "(Drift)Single client; Change preference during training",
    has_nested_route: "true",
    change_policy: true,
    change_prob_idxs: { 0: [0, 2] }, // indexes for probability value change
    change_probs: { 0: [0.7, 0.9] }, // probability value for different indexes given by change_prob_idxs
    time_interval_for_policy_change: 200,
  },
  4: {
    base_url: "ui-client",
    no_of_clients: 2,
    dim: 24,
    model_name: "example_4",
    description:
      "(Diff)Multiple clients with different preferences; No preference change",
    has_nested_route: "true",
    change_policy: false,
    change_prob_idxs: { 0: [0], 1: [1] }, // indexes for probability value change
    change_probs: { 0: [0.8], 1: [0.8] }, // probability value for different indexes given by change_prob_idxs
  },
  5: {
    base_url: "ui-client",
    no_of_clients: 2,
    dim: 24,
    model_name: "example_5",
    description:
      "(Drift and Diff)Multiple clients with different preferences; Change preference of first client while training",
    has_nested_route: "true",
    change_policy: true,
    change_prob_idxs: { 0: [0, 4], 1: [1, 1] }, // indexes for probability value change
    change_probs: { 0: [0.7, 0.8], 1: [0.7, 0.7] }, // probability value for different indexes given by change_prob_idxs
    time_interval_for_policy_change: 200,
  },
  6: {
    base_url: "web-client",
    no_of_clients: 1,
    dim: 24,
    description: "Web Client; No preference change and one client only",
    has_nested_route: "false",
    model_name: "example_6",
    change_policy: false,
    change_prob_idxs: { 0: [0], 1: [1] }, // indexes for probability value change
    change_probs: { 0: [0.8], 1: [0.8] }, // probability value for different indexes given by change_prob_idxs
  },
  7: {
    base_url: "web-client",
    no_of_clients: 2,
    dim: 24,
    description:
      "Web Client; No preference change and two clients with different probabilities",
    has_nested_route: "false",
    model_name: "example_7",
    change_policy: false,
    change_prob_idxs: { 0: [0, 4], 1: [1, 1] }, // indexes for probability value change
    change_probs: { 0: [0.7, 0.8], 1: [0.7, 0.7] }, // probability value for different indexes given by change_prob_idxs
  },
};

export {
  META_DATA,
  COLORS,
  BOOKS,
  BOOK_TYPES,
  ALL_UIOPTIONS,
  OPTION_TYPES,
  WEB_OPTIONS,
};
