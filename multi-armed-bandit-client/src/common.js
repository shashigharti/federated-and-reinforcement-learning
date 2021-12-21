const { jStat } = require("jstat");

// process plot data
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

// Arg max function
const argMax = (d) =>
  Object.entries(d).filter(
    (el) => el[1] == Math.max(...Object.values(d))
  )[0][0];

// update alphas and betas based on user action
const banditThompson = (reward_vector, sample_vector, alphas, betas) => {
  const prev_alpha = alphas;
  const prev_beta = betas;

  alphas = prev_alpha.add(reward_vector);
  betas = prev_beta.add(sample_vector.sub(reward_vector));
  return [alphas, betas];
};

export { processPlot, argMax, banditThompson };
