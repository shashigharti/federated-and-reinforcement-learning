import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs-core";
const { jStat } = require("jstat");
import Plot from "react-plotly.js";

const MainPage = () => {
  const url = useState("ws://127.0.0.1:1234");
  const [alphasArray, setAlphasArray] = useState([]);
  const [betasArray, setBetasArray] = useState([]);
  const [options, setOptions] = useState(0);
  const [selectedOption, setSelectedOption] = useState(0);
  const [plotdata, setPlotData] = useState([]);
  const [bookTypes, setBookTypes] = useState([
    "spiritual",
    "philosophical",
    "physics",
  ]);
  const [imgSrc, setImageSrc] = useState("");
  const [books, setBooks] = useState({
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
  });

  // Arg max function
  const argMax = (d) =>
    Object.entries(d).filter(
      (el) => el[1] == Math.max(...Object.values(d))
    )[0][0];

  // select initial sample
  useEffect(() => {
    selectSample();
  }, [alphasArray]);

  const selectSample = () => {
    let samplesFromBetaDist = [];
    // For each option...
    for (let opt = 0; opt < alphasArray.length; opt++) {
      // Get a beta distribution between the alphas and betas
      samplesFromBetaDist[opt] = jStat.beta.sample(
        alphasArray[opt],
        betasArray[opt]
      );
    }

    if (samplesFromBetaDist.length > 0) {
      // random selection of image to display
      setSelectedOption(argMax(samplesFromBetaDist));

      // set the image src
      setImageSrc(books[selectedOption][0]);
    }
  };

  useEffect(() => {
    setOptions(Object.keys(books).length);
  }, []);

  useEffect(() => {
    // get alphas and betas from server
    setAlphasArray([1, 1, 1]);
    setBetasArray([1, 1, 1]);
  }, [options]);

  // update alphas and betas based on user action
  const bandit_thompson = (reward_vector, sample_vector, alphas, betas) => {
    console.log(
      "updating alpha beta variables",
      alphas.dataSync(),
      betas.dataSync()
    );
    const prev_alpha = alphas;
    const prev_beta = betas;

    alphas = prev_alpha.add(reward_vector);
    betas = prev_beta.add(sample_vector.sub(reward_vector));
    return [alphas, betas];
  };

  // handle user action
  const handleClick = (reward) => () => {
    console.log("reward=>", reward);
    let alphas_betas;
    let rewardVector = [0, 0, 0];
    let sampledVector = [0, 0, 0];

    rewardVector[selectedOption] = reward; // reward
    sampledVector[selectedOption] = 1;

    alphas_betas = bandit_thompson(
      tf.tensor(rewardVector),
      tf.tensor(sampledVector),
      tf.tensor(alphasArray),
      tf.tensor(betasArray)
    );

    setAlphasArray(alphas_betas[0].dataSync());
    setBetasArray(alphas_betas[1].dataSync());

    console.log("new alphas and betas", alphasArray, betasArray);

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
    console.log(plotdata);
    setPlotData(plotdata);
    selectSample();
  };
  return (
    <>
      <div id='main'>
        <div className='row'>
          <div className='col s8'>
            <h3>Federated Learning (Thompson Sampling - Book Sale)</h3>
            <div>alphas array: {alphasArray.toString()}</div>
            <div>betas array: {betasArray.toString()}</div>
            <div>
              <Plot data={plotdata} layout={{ title: "Distribution Plot" }} />
            </div>
          </div>
          <div className='col s4'>
            <img src={imgSrc} alt='Physics Book' width='600px' height='600px' />
            <div className='center-align col s12'>
              <a
                className='waves-effect waves-light btn'
                onClick={handleClick(1)}
              >
                View
              </a>
              <a
                className='waves-effect waves-light btn'
                onClick={handleClick(0)}
              >
                Next
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
