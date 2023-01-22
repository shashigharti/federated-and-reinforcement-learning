const ADS = {
    0: "https://m.media-amazon.com/images/I/51jBeCDwMQL.jpg",
    1: "https://images-na.ssl-images-amazon.com/images/I/81Kr+YIWjCL.jpg",
    2: "https://d3nuqriibqh3vw.cloudfront.net/styles/aotw_detail_ir/s3/images/northernPhysics.jpg",
  };
const ALL_UIOPTIONS = ["books", "news", "travel"];
const META_DATA = {
    1: {
        base_url: "book-client",
        no_of_clients: 3,
        dim: 3,
        model_name: "example_1",
        has_nested_route: "false",
        change_policy: false,
        change_prob_idxs: { 0: [0], 1: [1] }, // indexes for probability value change
        change_probs: { 0: [0.8], 1: [0.9] }, // probability value for different indexes given by change_prob_idxs
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
        dim: 3,
        model_name: "example_6",
        has_nested_route: "false",
        change_policy: false,
        change_prob_idxs: { 0: [0] }, // indexes for probability value change
        change_probs: { 0: [0.8] }, // probability value for different indexes given by change_prob_idxs
    },
    7: {
        base_url: "web-client",
        no_of_clients: 2,
        dim: 24,
        model_name: "example_7",
        description:
        "(Drift and Diff)Multiple clients with different preferences; Change preference of first client while training",
        has_nested_route: "true",
        change_policy: true,
        change_prob_idxs: { 0: [0, 4], 1: [1, 1] }, // indexes for probability value change
        change_probs: { 0: [0.7, 0.8], 1: [0.7, 0.7] }, // probability value for different indexes given by change_prob_idxs
        time_interval_for_policy_change: 200,
    },
};
  
export { ADS, META_DATA, ALL_UIOPTIONS };
  