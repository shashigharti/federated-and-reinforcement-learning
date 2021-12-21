import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs-core";
const { jStat } = require("jstat");
import Plot from "react-plotly.js";
import { processPlot, argMax, banditThompson } from "./common";
import { BOOKS, BOOK_TYPES } from "./data";

const MainPage = () => {
  const url = "ws://127.0.0.1:1234";
  const socket = new WebSocket(url);

  // features/parameters that determine the users action
  let [alphasArray, setAlphasArray] = useState([]);
  let [betasArray, setBetasArray] = useState([]);

  // user options : 3 types of book
  const [options, setOptions] = useState(0);
  const [selectedOption, setSelectedOption] = useState(0);
  const [plotdata, setPlotData] = useState([]);
  const [bookTypes, setBookTypes] = useState(BOOK_TYPES);
  const [imgSrc, setImageSrc] = useState("");
  const [books, setBooks] = useState(BOOKS);

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

  // select initial sample
  useEffect(() => {
    if (alphasArray.length == betasArray.length) {
      console.log("updated alphasarray", alphasArray);
      console.log("updated alphasarray", betasArray);

      selectSample();
    }
  }, [alphasArray, betasArray]);

  useEffect(() => {
    // get params from server
    socket.onopen = (message) => {
      console.log("[socket]Connecton Established");
      socket.send(["connection", "Connection Established"]);
    };
    socket.onmessage = (event) => {
      const message_from_server = JSON.parse(event.data);
      if (message_from_server["type"] == "params") {
        alphasArray = message_from_server.params["al"];
        betasArray = message_from_server.params["bt"];
        console.log("Received aplhas betas", alphasArray, betasArray);
        setAlphasArray(alphasArray);
        setBetasArray(betasArray);
      }
    };
  }, [options]);

  // handle user action
  const handleClick = (reward) => () => {
    console.log("reward=>", reward);
    let alphas_betas;
    let rewardVector = [0, 0, 0];
    let sampledVector = [0, 0, 0];

    rewardVector[selectedOption] = reward; // reward
    sampledVector[selectedOption] = 1;

    console.log(
      "updating alpha beta variables",
      tf.tensor(alphasArray).dataSync(),
      tf.tensor(betasArray).dataSync()
    );
    alphas_betas = banditThompson(
      tf.tensor(rewardVector),
      tf.tensor(sampledVector),
      tf.tensor(alphasArray),
      tf.tensor(betasArray)
    );

    setAlphasArray(alphas_betas[0].dataSync());
    setBetasArray(alphas_betas[1].dataSync());

    console.log("new alphas and betas", alphasArray, betasArray);
    setPlotData(processPlot(alphasArray, betasArray, bookTypes));

    socket.send([
      "update",
      JSON.stringify({
        alphas: alphas_betas[0], // 0 ->  alphas
        betas: alphas_betas[1], // 1 -> betas
      }),
    ]);
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
