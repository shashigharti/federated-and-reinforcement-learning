import React, { useState, useEffect } from "react";
const { jStat } = require("jstat");
import { argMax, simulate, actionAndUpdate } from "./common";
import { ALL_UIOPTIONS } from "./data";
import UIClient from "./components/uiclient";
import ErrorBoundary from "./components/errorboundary";

const UIClientPage = () => {
  // Socket remote server
  const url = "ws://127.0.0.1:8000/fl-server/example_2";
  const dim = 24;
  const stopAfter = 1000;
  const policies = [
    [
      0.7, 0.01, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.02, 0.01, 0.02,
      0.02, 0.01, 0.01, 0.02, 0.01, 0.02, 0.01, 0.01, 0.02, 0.01, 0.01, 0.01,
    ],
    [
      0.6, 0.02, 0.03, 0.02, 0.02, 0.02, 0.01, 0.01, 0.01, 0.05, 0.01, 0.05,
      0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.02, 0.02, 0.02, 0.01, 0.01,
    ],
    [
      0.7, 0.02, 0.03, 0.01, 0.01, 0.02, 0.01, 0.01, 0.01, 0.05, 0.01, 0.0,
      0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01,
    ],
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
  let [config, setConfig] = useState(ALL_UIOPTIONS[0]);

  // User options : 24 different ui design
  const [uiOptions, setUIOptions] = useState(ALL_UIOPTIONS);
  const [cycle, setCycle] = useState(0);
  const [endCycle, setEndCycle] = useState(false);
  const [options, setOptions] = useState(0);
  const [selectedOption, setSelectedOption] = useState(0);

  /**
   * Choose the best option(with highest reward probability) among other various options;
   * random probability using beta distribution
   */
  const selectSample = () => {
    let samplesFromBetaDist = [];

    // For each option find the probability using beta distribution
    for (let opt = 0; opt < alphasArray.length; opt++) {
      // Get a beta distribution fro all alpha and beta pair
      samplesFromBetaDist[opt] = jStat.beta.sample(
        alphasArray[opt],
        betasArray[opt]
      );
    }
    setBetaDistribution(samplesFromBetaDist);
    console.log("[Socket]Beta Distribution", samplesFromBetaDist);

    if (samplesFromBetaDist.length > 0) {
      // Random selection of option from available ones
      setSelectedOption(argMax(samplesFromBetaDist));
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
            model_name: "example_2",
          })
        );
      }
    }
  };

  useEffect(() => {
    setSelectedOption(2);
    setOptions(Object.keys(uiOptions).length);
  }, []);

  useEffect(() => {
    setConfig(uiOptions[selectedOption]);
    console.log("Changed selected option", selectedOption, config);
  }, [selectedOption]);

  useEffect(() => {
    setCycle(cycle + 1);
    console.log("cycle", cycle);
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
          model_name: "example_2",
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
        setCycle(message_from_server.params["cycle"]);
        setEndCycle(true);
        setAlphasArray(message_from_server.params["al"]);
        setBetasArray(message_from_server.params["bt"]);
      }
    };
  }, [socket]);

  return (
    <>
      <div id='main'>
        <ErrorBoundary>
          <UIClient config={config}></UIClient>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default UIClientPage;
