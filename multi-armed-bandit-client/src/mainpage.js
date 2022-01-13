import React, { useState, useEffect } from "react";
const { jStat } = require("jstat");
import Plot from "react-plotly.js";
import { argMax, processPlot, simulate, actionAndUpdate } from "./common";
import { BOOKS, BOOK_TYPES } from "./data";

const MainPage = () => {
  // const url = "ws://127.0.0.1:1234";
  const url = "ws://127.0.0.1:8000/fl-server";
  const dim = 3;
  const stopAfter = 10;
  const policies = [
    [0.7, 0.2, 0.1],
    [0.8, 0.15, 0.05],
    [0.6, 0.2, 0.2],
  ];
  let [simulation, setSimulation] = useState(true);
  let [socket, setSocket] = useState(null);

  // Features/parameters that determine the users action
  let [alphasArray, setAlphasArray] = useState([]);
  let [betasArray, setBetasArray] = useState([]);
  let [policy, setPolicy] = useState([]);
  let [reward, setReward] = useState([]);
  let [betaDistribution, setBetaDistribution] = useState([]);
  let [clientId, SetClientId] = useState(null);

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
    setBetaDistribution(samplesFromBetaDist);
    console.log("[Socket]Beta Distribution", samplesFromBetaDist);

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
          "[Socket]Diff: alphas and betas",
          gradWeights[0].dataSync(),
          gradWeights[1].dataSync()
        );

        // Send data to the server
        console.log(
          "[Socket]Sending new gradients to the server",
          gradWeights[0].dataSync(),
          gradWeights[1].dataSync()
        );

        socket.send(
          JSON.stringify({
            event: "update", // 0 ->  event
            alphas: gradWeights[0].dataSync(), // 1 ->  alphas
            betas: gradWeights[1].dataSync(), // 2 -> betas
            client_id: clientId,
          })
        );
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
    if (
      (alphasArray.length == betasArray.length &&
        policy.length > 0 &&
        cycle == 1) ||
      endCycle
    ) {
      console.log("[Socket] policy", policy);
      setEndCycle(false);
      selectSample();
    }
  }, [alphasArray, betasArray, policy]);

  useEffect(() => {
    if (options == 0) return;

    setSocket(new WebSocket(url));
  }, [options]);

  useEffect(() => {
    // Policy is set locally now
    // let local_policy = Array.from({ length: 3 }, () =>
    //   Math.min(Math.abs(Math.random() - Math.random() / 10), 0.77)
    // );
    // Set the spiritual book selection probability to the highest

    console.log("clientId", clientId);
    if (clientId != null) {
      let local_policy = policies[clientId];
      console.log("[Socket]Selected Policy:", local_policy);
      setPolicy(local_policy);
    }
  }, [clientId]);

  useEffect(() => {
    if (socket == null) return;

    // Get params from server
    socket.onopen = (message) => {
      console.log("[Socket]Connecton Established");
      let clientId = Math.floor(Math.random() * 3);
      SetClientId(clientId);
      socket.send(
        JSON.stringify({
          event: "connected", // 0 ->  alphas
          client_id: clientId,
        })
      );
    };

    // Handle message received from server
    socket.onmessage = (event) => {
      const message_from_server = JSON.parse(event.data);
      let dim_from_server = null;
      console.log("[Socket]Message Received", message_from_server);

      // Sets params with the value received from the server
      if (message_from_server["type"] == "init-params") {
        dim_from_server = message_from_server.params["dim"];

        // Set the values
        if (dim_from_server == dim) {
          console.log("[Socket]Valid dimension");

          console.log(
            "[Socket]INIT - Received aplhas betas dim policy",
            message_from_server.params["al"],
            message_from_server.params["bt"],
            dim_from_server
          );

          setAlphasArray(message_from_server.params["al"]);
          setBetasArray(message_from_server.params["bt"]);

          // setPolicy(policy); // commenting this part; the policy is received from the server.
        } else {
          console.log("[Socket]Dimension does not match. ");
        }
      } else if (message_from_server["type"] == "new_weights") {
        console.log(
          "[Socket]New Weights",
          message_from_server.params["al"],
          message_from_server.params["bt"],
          message_from_server.params["cycle"]
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
      "[Socket]Diff: alphas and betas",
      gradWeights[0].dataSync(),
      gradWeights[1].dataSync()
    );

    // Send data to the server
    console.log("[Socket]Sending new gradients to the server");
    socket.send(
      JSON.stringify({
        event: "update", // 0 ->  event
        alphas: gradWeights[0].dataSync(), // 1 ->  alphas
        betas: gradWeights[1].dataSync(), // 2 -> betas
        client_id: clientId,
      })
    );
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
              Policy: {policy.toString()} | Selected Book Type:{" "}
              {bookTypes[selectedOption]}
            </div>
            <div>
              Beta Distribution:{" "}
              {Array.from(betaDistribution, (x) => x.toFixed(2)).toString()}
            </div>
            <div>
              Dimension: {dim} | Cycle: {cycle}
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
