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
    has_nested_route: "true",
  },
  3: {
    base_url: "ui-client",
    no_of_clients: 2,
    dim: 24,
    model_name: "example_3",
    has_nested_route: "true",
  },
};

export { META_DATA, COLORS, BOOKS, BOOK_TYPES, ALL_UIOPTIONS, OPTION_TYPES };
