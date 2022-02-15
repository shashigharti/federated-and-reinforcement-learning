import React, { useState, useEffect } from "react";
const { jStat } = require("jstat");
import { argMax, simulate, actionAndUpdate } from "./common";
import { META_DATA, ALL_UIOPTIONS } from "./data";
import UIClient from "./components/uiclient";
import ErrorBoundary from "./components/errorboundary";
import { generatePolicies, clientPreferences } from "./common";

const UIClientPage = () => {
  // Socket remote server
  const url =
    "ws://" +
    process.env.API_ENDPOINT +
    "/fl-server/" +
    META_DATA[2].model_name;
  const dim = process.env.UICLIENT_DIM; // default 24
  const noOfClients = process.env.NO_OF_CLIENTS; // default 2
  const stopAfter = process.env.STOP_AFTER; // default 1000
  const initProb = process.env.INIT_PROB; // default .7
  const probAfterChange = process.env.PROB_AFTER_CHANGE; // default .7
  const updatePoliciesAfter = process.env.TIME_INTERVAL_FOR_POLICY_CHANGE; // update policies after 300 rounds
  const [policies, setPolicies] = useState([]);
  let [simulation, setSimulation] = useState(true);
  let [socket, setSocket] = useState(null);
  let [allSelectedOptions, setAllSelectedOptions] = useState({});

  // Features/parameters that determine the users action
  let [alphasArray, setAlphasArray] = useState([]);
  let [betasArray, setBetasArray] = useState([]);
  let [policy, setPolicy] = useState([]);
  let [betaDistribution, setBetaDistribution] = useState([]);
  let [clientId, SetClientId] = useState(null);
  let [config, setConfig] = useState(ALL_UIOPTIONS[0]);
  let [updateWeights, setUpdateWeights] = useState(false);

  // User options : 24 different ui design
  const [uiOptions] = useState(ALL_UIOPTIONS);
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
      // Get a beta distribution for all alpha and beta pair
      samplesFromBetaDist[opt] = jStat.beta.sample(
        alphasArray[opt],
        betasArray[opt]
      );
    }
    setBetaDistribution(samplesFromBetaDist);
  };

  useEffect(() => {
    console.log("[Socket]Beta Distribution", betaDistribution);
    console.log("[Socket]Policy", policy);
    // setSelectedOption(argMax(betaDistribution));

    if (betaDistribution.length > 0) {
      // Random selection of option from available ones
      let selected_option = argMax(betaDistribution);
      setSelectedOption(selected_option);
      console.log("[Socket]New option selected:", selected_option);

      // Set variable to trigger weight update
      setUpdateWeights(true);
    }
  }, [betaDistribution]);

  useEffect(() => {
    // Change user display
    setConfig(uiOptions[selectedOption]);

    // Changed selected option
    console.log("[Socket]Update selected option", selectedOption, config);

    // Set variable to trigger weight update
    setUpdateWeights(true);
    let newval = 1;
    if (selectedOption in allSelectedOptions) {
      newval = allSelectedOptions[selectedOption] + 1;
    }

    setAllSelectedOptions({
      ...allSelectedOptions,
      [selectedOption]: newval,
    });
  }, [selectedOption]);

  useEffect(() => {
    console.log("All Selected Options", allSelectedOptions);
  }, [allSelectedOptions]);

  useEffect(() => {
    // If simulation is true, simulate the user action
    if (simulation && cycle <= stopAfter && updateWeights == true) {
      console.log("[Socket]Simulate");

      let new_reward = simulate(policy, selectedOption);
      // setReward(reward + new_reward);
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
        console.log("[Socket]Sending new gradients to the server");

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
      // Set variable to false to disable weight update
      setUpdateWeights(false);
    }
  }, [updateWeights]);

  useEffect(() => {
    // Set client preference to option 0
    let client_preference = clientPreferences(noOfClients, 0, initProb);
    setPolicies(generatePolicies(noOfClients, true, dim, client_preference));
  }, []);

  useEffect(() => {
    setOptions(Object.keys(uiOptions).length);
    console.log("[Socket]Policies", policies);
  }, [policies]);

  useEffect(() => {
    if (endCycle == true) {
      setCycle(cycle + 1);
      console.log("[Socket]New cycle", cycle);
    }
  }, [endCycle]);

  const findHighestValue = (obj) => {
    const arr = Object.keys(obj).map((el) => {
      return obj[el];
    });
    arr.sort((a, b) => {
      return a - b;
    });

    let second_highest_value = arr[arr.length - 2];
    console.log("Second highest value", second_highest_value);

    for (let i = 1; i < arr.length; i++) {
      if (obj[i] == second_highest_value) {
        return i;
      }
    }
    return false;
  };

  useEffect(() => {
    if (cycle == updatePoliciesAfter) {
      // Find the option with the second highest value
      let highestValueIndex = 2; //findHighestValue(allSelectedOptions);
      console.log("Highest Value Index:", highestValueIndex);

      // Change client preference to option highestValueIndex
      let client_preference = clientPreferences(
        noOfClients,
        highestValueIndex,
        probAfterChange
      );
      setPolicies(generatePolicies(noOfClients, true, dim, client_preference));
    }
  }, [cycle]);

  // Take initial action on weights received from the server
  useEffect(() => {
    if ((alphasArray.length == betasArray.length && cycle == 0) || endCycle) {
      console.log("[Socket]Set end cycle to false");
      setEndCycle(false);
      selectSample();
    }
  }, [alphasArray, betasArray, policy]);

  useEffect(() => {
    if (options == 0) return;
    setSocket(new WebSocket(url));
  }, [options]);

  useEffect(() => {
    let clientId = Math.floor(Math.random() * noOfClients);
    SetClientId(clientId);
  }, [policies]);

  // Set local policy
  useEffect(() => {
    console.log("[Socket]ClientId", clientId);
    console.log("[Socket]Policies", policies);
    if (clientId != null && policies != null) {
      let local_policy = policies[clientId];
      setPolicy(local_policy);
      console.log("[Socket]Selected Local Policy:", local_policy);
    }
  }, [clientId, policies]);

  useEffect(() => {
    if (socket == null || clientId == null) return;

    // Get params from server
    socket.onopen = (message) => {
      console.log("[Socket]Connecton Established");
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
          "************* [Socket]Received New Weights & Cycle ********************",
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
