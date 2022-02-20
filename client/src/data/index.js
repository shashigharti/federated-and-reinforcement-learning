import { BOOKS, BOOK_TYPES } from "./bookclient";
import { COLORS, ALL_UIOPTIONS, OPTION_TYPES } from "./uiclient";

const META_DATA = {
  1: {
    base_url: "book-client",
    no_of_clients: 3,
    dim: 3,
    model_name: "example_1",
  },
  2: {
    base_url: "ui-client",
    no_of_clients: 1,
    dim: 24,
    model_name: "example_2",
    description: "Single client; without preference change while training",
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
    description:
      "Single client; change preference in the middle of the training",
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
      "Multiple clients with different preferences; without preference change while training",
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
      "Multiple clients with different preferences; change preference of first client while training",
    has_nested_route: "true",
    change_policy: true,
    change_prob_idxs: { 0: [0, 4], 1: [1, 1] }, // indexes for probability value change
    change_probs: { 0: [0.7, 0.8], 1: [0.7, 0.7] }, // probability value for different indexes given by change_prob_idxs
    time_interval_for_policy_change: 200,
  },
};

export { META_DATA, COLORS, BOOKS, BOOK_TYPES, ALL_UIOPTIONS, OPTION_TYPES };
