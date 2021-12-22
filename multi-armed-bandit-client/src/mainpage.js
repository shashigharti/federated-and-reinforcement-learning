import React, { useState, useEffect } from "react";
const { jStat } = require("jstat");
import Plot from "react-plotly.js";
import { argMax, processPlot, simulate, actionAndUpdate } from "./common";
import { BOOKS, BOOK_TYPES } from "./data";

const MainPage = () => {
  const url = "ws://127.0.0.1:1234";
  const dim = 3;
  const stopAfter = 1000;
  let [simulation, setSimulation] = useState(true);
  let [socket, setSocket] = useState(null);

  // Features/parameters that determine the users action
  let [alphasArray, setAlphasArray] = useState([]);
  let [betasArray, setBetasArray] = useState([]);
  let [policy, setPolicy] = useState([]);
  let [reward, setReward] = useState([]);

  // User options : 3 types of books
  const [bookTypes, setBookTypes] = useState(BOOK_TYPES);

  const [cycle, setCycle] = useState(0);
  const [endCycle, setEndCycle] = useState(false);
  const [options, setOptions] = useState(0);
  const [selectedOption, setSelectedOption] = useState(0);
  const [plotdata, setPlotData] = useState([]);
  const [imgSrc, setImageSrc] = useState("");
  const [books, setBooks] = useState(BOOKS);

  /**
   * Choose the best option(with highest reward probability) among other various options;
   * random probability using beta distribution
   */
  const selectSample = () => {
    let samplesFromBetaDist = [];

    // for each option find the probability using beta distribution
    for (let opt = 0; opt < alphasArray.length; opt++) {
      // Get a beta distribution between the alphas and betas
      samplesFromBetaDist[opt] = jStat.beta.sample(
        alphasArray[opt],
        betasArray[opt]
      );
    }

    if (samplesFromBetaDist.length > 0) {
      // Random selection of image to display
      setSelectedOption(argMax(samplesFromBetaDist));

      // Choose a random image among options
      const random = Math.floor(Math.random() * books[selectedOption].length);
      setImageSrc(books[selectedOption][random]);
    }

    // If simulation is true, simulate the user action
    if (simulation && cycle <= stopAfter) {
      let new_reward = simulate(policy, selectedOption);
      setReward(reward + new_reward);

      let params = actionAndUpdate(
        alphasArray,
        betasArray,
        selectedOption,
        new_reward
      );

      if (params) {
        let gradWeights, alphas_betas;
        gradWeights = params[0];
        alphas_betas = params[1];

        // Set plot data to display graphs
        setPlotData(
          processPlot(
            alphas_betas[0].dataSync(),
            alphas_betas[1].dataSync(),
            bookTypes
          )
        );

        console.log(
          "diff: alphas and betas",
          gradWeights[0].dataSync(),
          gradWeights[1].dataSync()
        );

        // Send data to the server
        console.log("Sending new weights to the server");
        socket.send([
          "update",
          JSON.stringify({
            alphas: gradWeights[0].dataSync(), // 0 ->  alphas
            betas: gradWeights[1].dataSync(), // 1 -> betas
          }),
        ]);
      }
    }
  };

  useEffect(() => {
    setOptions(Object.keys(books).length);
  }, []);

  useEffect(() => {
    setCycle(cycle + 1);
  }, [endCycle]);

  // Take initial action on params receive from the server
  useEffect(() => {
    if ((alphasArray.length == betasArray.length && cycle == 1) || endCycle) {
      setEndCycle(false);
      selectSample();
    }
  }, [alphasArray, betasArray]);

  useEffect(() => {
    if (options == 0) return;
    setSocket(new WebSocket(url));
  }, [options]);

  useEffect(() => {
    if (socket == null) return;

    // Get params from server
    socket.onopen = (message) => {
      console.log("[socket]Connecton Established");
      socket.send(["connected", "Connection Established"]);
    };

    // Handle message received from server
    socket.onmessage = (event) => {
      const message_from_server = JSON.parse(event.data);
      let dim_from_server = null;

      // Sets params with the value received from the server
      if (message_from_server["type"] == "init-params") {
        dim_from_server = message_from_server.params["dim"];

        // Set the values
        if (dim_from_server == dim) {
          console.log("[Server]Valid dimension");
          setAlphasArray(message_from_server.params["al"]);
          setBetasArray(message_from_server.params["bt"]);
          // setPolicy(policy); // commenting this part; the policy is received from the server.

          console.log(
            "[Server]INIT - Received aplhas betas dim policy",
            setAlphasArray(message_from_server.params["al"]),
            setAlphasArray(message_from_server.params["bt"]),
            dim_from_server,
            message_from_server.params["policy"]
          );

          // Policy is set locally now
          let local_policy = Array.from({ length: 3 }, () =>
            Math.min(Math.abs(Math.random() - Math.random() / 10), 0.77)
          );

          // Set the spiritual book selection probability to the highest
          local_policy[0] = 0.8;
          setPolicy(local_policy);
        } else {
          console.log("[Server]Dimension does not match. ");
        }
      } else if (
        message_from_server["type"] == "avg" ||
        message_from_server["type"] == "update"
      ) {
        console.log(
          "[Server]Received updated aplhas betas",
          message_from_server.params["al"],
          message_from_server.params["bt"]
        );
        setEndCycle(true);
        setAlphasArray(message_from_server.params["al"]);
        setBetasArray(message_from_server.params["bt"]);
      }
    };
  }, [socket]);

  /**
   * Handle user action
   * @param {number} reward
   * @returns
   */
  const handleClick = (socket, new_reward) => () => {
    setCycle(cycle + 1);
    let params = actionAndUpdate(
      alphasArray,
      betasArray,
      selectedOption,
      new_reward
    );

    setReward(reward + new_reward);

    let gradWeights, alphas_betas;
    gradWeights = params[0];
    alphas_betas = params[1];

    // Set plot data
    setPlotData(
      processPlot(
        alphas_betas[0].dataSync(),
        alphas_betas[1].dataSync(),
        bookTypes
      )
    );

    console.log(
      "diff: alphas and betas",
      gradWeights[0].dataSync(),
      gradWeights[1].dataSync()
    );

    // Send data to the server
    console.log("Sending new weights to the server");
    socket.send([
      "update",
      JSON.stringify({
        alphas: gradWeights[0].dataSync(), // 0 ->  alphas
        betas: gradWeights[1].dataSync(), // 1 -> betas
      }),
    ]);
  };

  return (
    <>
      <div id='main'>
        <div className='row'>
          <div className='col s8'>
            <h3>Federated Learning (Thompson Sampling - Book Sale)</h3>
            <div>
              Alphas: {alphasArray.toString()} | Betas: {betasArray.toString()}
            </div>
            <div>
              Dimension: {dim} | Cycle: {cycle}
            </div>
            <div>
              Policy: {policy.toString()} | Selected Book Type:{" "}
              {bookTypes[selectedOption]}
            </div>
            <div>
              <Plot data={plotdata} layout={{ title: "Distribution Plot" }} />
            </div>
          </div>
          <div className='col s4'>
            <img src={imgSrc} width='600px' height='600px' />
            <div className='center-align col s12'>
              <a
                className='waves-effect waves-light btn'
                onClick={handleClick(socket, 1)}
              >
                View
              </a>
              <a
                className='waves-effect waves-light btn'
                onClick={handleClick(socket, 0)}
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
