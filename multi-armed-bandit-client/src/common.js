const { jStat } = require("jstat");
import * as tf from "@tensorflow/tfjs-core";

const binomial_sample = (accept_rate) => (Math.random() < accept_rate ? 1 : 0);
class Simulator {
  constructor(rates) {
    this.rates = rates;
    this.action_space = Array(rates.length);
  }
  simulate(idx) {
    let choice = binomial_sample(this.rates[idx]);
    return choice;
  }
}

/**
 * Process plot data
 * @param {Array} alphasArray
 * @param {Array} betasArray
 * @param {Array} bookTypes
 * @returns {Array} plotdata
 */
const processPlot = (alphasArray, betasArray, bookTypes) => {
  const x = tf.linspace(0, 1, 100).dataSync();
  const colors = { 0: "red", 1: "green", 2: "blue" };

  let plotdata = [];
  for (let opt = 0; opt < alphasArray.length; opt++) {
    let y = [];
    for (let ind = 0; ind < x.length; ind++) {
      y.push(jStat.beta.pdf(x[ind], alphasArray[opt], betasArray[opt]));
    }
    let d = {
      x: x,
      y: y,
      name: bookTypes[opt],
      type: "scatter",
      mode: "lines+markers",
      marker: { color: colors[opt] },
    };
    plotdata.push(d);
  }
  return plotdata;
};

/**
 * Get maximum value
 */
const argMax = (d) =>
  Object.entries(d).filter(
    (el) => el[1] == Math.max(...Object.values(d))
  )[0][0];

/**
 * Update alphas and betas
 * @param {Tensor1D} rewards
 * @param {Tensor1D} samples
 * @param {Tensor1D} alphas
 * @param {Tensor1D} betas
 * @returns
 */
const banditThompson = (rewards, samples, alphas, betas) => {
  const prev_alpha = alphas;
  const prev_beta = betas;

  alphas = prev_alpha.add(rewards);
  betas = prev_beta.add(samples.sub(rewards));
  return [alphas, betas];
};

/**
 * Calculate gradients
 * @param {Tensor1D} alphas
 * @param {Tensor1D} betas
 * @param {Tensor1D} n_alphas
 * @param {Tensor1D} n_betas
 * @returns
 */
const calcGradient = (alphas, betas, n_alphas, n_betas) => {
  let d_alphas, d_betas;
  d_alphas = n_alphas.sub(alphas);
  d_betas = n_betas.sub(betas);
  return [d_alphas, d_betas];
};

/**
 * Simulate user action
 * @param {Array} preferences
 * @param {number} option_id
 * @returns
 */
const simulate = (simulated_rates, selectedOption) => {
  const env = new Simulator(simulated_rates);
  return env.simulate(selectedOption);
};

const actionAndUpdate = (alphasArray, betasArray, selectedOption, reward) => {
  let alphas_betas;
  let rewardVector = Array(alphasArray.length).fill(0);
  let sampledVector = Array(alphasArray.length).fill(0);
  console.log(
    "action update selectedoption reward",
    alphasArray,
    betasArray,
    selectedOption,
    reward
  );

  if (
    alphasArray.length == 0 ||
    betasArray.length == 0 ||
    betasArray.length != alphasArray.length
  )
    return false;

  rewardVector[selectedOption] = reward; // reward
  sampledVector[selectedOption] = 1;

  alphas_betas = banditThompson(
    tf.tensor(rewardVector),
    tf.tensor(sampledVector),
    tf.tensor(alphasArray),
    tf.tensor(betasArray)
  );
  let gradWeights = calcGradient(
    tf.tensor(alphasArray),
    tf.tensor(betasArray),
    alphas_betas[0],
    alphas_betas[1]
  );

  return [gradWeights, alphas_betas];
};

export {
  processPlot,
  argMax,
  banditThompson,
  calcGradient,
  simulate,
  actionAndUpdate,
};
