// Metadata

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
      change_prob_idxs: { 0: [0] }, // indexes for probability value change
      change_probs: { 0: [0.8]}, // probability value for different indexes given by change_prob_idxs
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

const binomial_sample = (accept_rate) => (Math.random() < accept_rate ? 1 : 0);
    
/**
 * Get maximum value
 */
const argMax = (d) =>
    Object.entries(d).filter(
    (el) => el[1] == Math.max(...Object.values(d))
    )[0][0];


class Simulator {
    constructor(rates) {
        this.rates = rates;
        this.action_space = Array(rates.length);
    }
    simulate(idx) {
        console.log("[Website]Rates", this.rates);
        console.log("[Website]Rate, idx", this.rates[idx], ",", idx);
        let choice = binomial_sample(this.rates[idx]);
        return choice;
    }
}

/**
 * Simulate user action
 * @param {Array} preferences
 * @param {number} option_id
 * @returns {number}
 */
const simulate = (simulated_rates, selectedOption) => {
    const env = new Simulator(simulated_rates);
        return env.simulate(selectedOption);
    };


/**
 * Generate client preferences
 * @param {number} no_of_clients
 * @returns
 */
 let clientPreferences = (
  no_of_clients,
  index,
  change_prob_idxs,
  change_probs
) => {
  return Array(no_of_clients)
    .fill()
    .map(
      function (x, i) {
        return [this.probs[i][this.idx], this.probIdxs[i][this.idx]];
      },
      {
        probIdxs: change_prob_idxs,
        probs: change_probs,
        idx: index,
      }
    );
};

/**
 * Generate probabilities of size given by dimension. The probabilities sums up to 1
 * @param {number} dim
 * @returns {Array}
 */
const generateProbabilities = (dim, preference) => {
    let probabilities = [];
    console.log("[Website]Preference", preference);

    let prob_for_remaining = (1 - preference[0]) / dim;
    for (let i = 0; i < dim; i++) {
        if (i == preference[1]) {
        probabilities.push(preference[0]);
        } else {
        probabilities.push(prob_for_remaining);
        }
    }
    return probabilities;
};

/**
 * Generate policies dynamically for given number of clients.
 * @param {number} no_of_clients
 * @returns {Array}
 */
const generatePolicies = (no_of_clients, dim = 24, client_preferences) => {
    let policies = [];
    for (let i = 0; i < no_of_clients; i++) {
        let policy = generateProbabilities(dim, client_preferences[i]);
        policies.push(policy);
    }
    return policies;
};
  

export { argMax, simulate, clientPreferences, generatePolicies, ALL_UIOPTIONS, META_DATA };
