import React, { useState, useEffect } from "react";
const { jStat } = require("jstat");
import {
  argMax,
  simulate,
  actionAndUpdate,
  generatePolicies,
  clientPreferences,
} from "../common";
import { META_DATA, ALL_UIOPTIONS } from "../data";
import UIClient from "../components/uiclient";
import ErrorBoundary from "../components/errorboundary";
import { useParams } from "react-router-dom";

const WebClientPage = () => {
//   const { id, clientid } = useParams();

//   // Socket remote server
//   const url =
//     "ws://" +
//     process.env.WS_ENDPOINT +
//     "/fl-server/" +
//     META_DATA[id].model_name;

//   const dim = META_DATA[id].dim;
//   const noOfClients = META_DATA[id].no_of_clients;
//   const stopAfter = process.env.STOP_AFTER; // default 1000
//   const updatePoliciesAfter = META_DATA[id].time_interval_for_policy_change; // time interval for policy change
//   const changePolicy = META_DATA[id].change_policy;
//   const [probIdx, setProbIdx] = useState(0);
//   const [policies, setPolicies] = useState([]);
//   let [simulation, setSimulation] = useState(process.env.SIMULATION);
//   let [socket, setSocket] = useState(null);
//   let [allSelectedOptions, setAllSelectedOptions] = useState({});

//   // Features/parameters that determine the users action
//   let [alphasArray, setAlphasArray] = useState([]);
//   let [betasArray, setBetasArray] = useState([]);
//   let [policy, setPolicy] = useState([]);
//   let [betaDistribution, setBetaDistribution] = useState([]);
//   let [clientId, SetClientId] = useState(null);
  let [config, setConfig] = useState(ALL_UIOPTIONS[0]);
//   let [updateWeights, setUpdateWeights] = useState(false);

//   // User options : 24 different ui design
//   const [uiOptions] = useState(ALL_UIOPTIONS);
//   const [cycle, setCycle] = useState(0);
//   const [endCycle, setEndCycle] = useState(false);
//   const [options, setOptions] = useState(0);
//   const [selectedOption, setSelectedOption] = useState(0);

  let userActionPromiseResolve; // Stores the reference to resolve function for user action
  const userActionPromise = new Promise((resolve) => {
    userActionPromiseResolve = resolve;
  });

  // When the user clicks the button...
  const submitPositiveResult = (e) => {
    console.log("[Socket]User clicked");
    userActionPromiseResolve(true);
  };

  // When the user doesn't click the button...
  const submitNegativeResult = (e) => {
    console.log("[Socket]Did not Click");
    userActionPromiseResolve(false);
  };

  const add_noise = () => {
    return true;
  };

//   /**
//    * Choose the best option(with highest reward probability) among other various options;
//    * random probability using beta distribution
//    */
//   const selectSample = () => {
//     let samplesFromBetaDist = [];

//     // For each option find the probability using beta distribution
//     for (let opt = 0; opt < alphasArray.length; opt++) {
//       // Get a beta distribution for all alpha and beta pair
//       samplesFromBetaDist[opt] = jStat.beta.sample(
//         alphasArray[opt],
//         betasArray[opt]
//       );
//     }
//     setBetaDistribution(samplesFromBetaDist);
//   };

//   useEffect(() => {
//     console.log("[Socket]Beta Distribution", betaDistribution);
//     console.log("[Socket]Policy", policy);
//     // setSelectedOption(argMax(betaDistribution));

//     if (betaDistribution.length > 0) {
//       // Random selection of option from available ones
//       let selected_option = argMax(betaDistribution);
//       setSelectedOption(selected_option);
//       console.log("[Socket]New option selected:", selected_option);

//       // Set variable to trigger weight update
//       setUpdateWeights(true);
//     }
//   }, [betaDistribution]);

//   useEffect(() => {
//     // Change user display
//     setConfig(uiOptions[selectedOption]);

//     // Changed selected option
//     console.log("[Socket]Update selected option", selectedOption, config);

//     // Set variable to trigger weight update
//     setUpdateWeights(true);
//     console.log("[Socket] New Option Seletected, Initiate Weight Update");

//     let newval = 1;
//     if (selectedOption in allSelectedOptions) {
//       newval = allSelectedOptions[selectedOption] + 1;
//     }

//     setAllSelectedOptions({
//       ...allSelectedOptions,
//       [selectedOption]: newval,
//     });
//   }, [selectedOption]);

//   useEffect(() => {
//     console.log("[Socket]All Selected Options", allSelectedOptions);
//   }, [allSelectedOptions]);

useEffect(() => {
  async function updateNewWeights() {
    const clicked = await userActionPromise;
    "Button was clicked";
  }
  updateNewWeights();
})

//   useEffect(() => {
//     async function updateNewWeights() {
//       let new_reward;
//       console.log("[Socket]Simulate", simulation);
//       if (simulation) {
//         // If simulation is true, simulate the user action
//         new_reward = simulate(policy, selectedOption);
//       } else {
//         console.log("[Socket]Wait for user action");
//         // When the user clicks the button...
//         // Wait on user input...
//         const clicked = await userActionPromise;

//         // If they clicked, set the reward value for this option to be a 1, otherwise it's a 0
//         new_reward = clicked ? 1 : 0;
//       }

//       let params = actionAndUpdate(
//         alphasArray,
//         betasArray,
//         selectedOption,
//         new_reward
//       );
//       console.log("[Socket]params", params);

//       if (params) {
//         let gradWeights;
//         gradWeights = params[0];

//         console.log(
//           "[Socket]Diff: alphas and betas",
//           gradWeights[0].dataSync(),
//           gradWeights[1].dataSync()
//         );

//         // Send data to the server
//         console.log("[Socket]Sending new gradients to the server");

//         socket.send(
//           JSON.stringify({
//             event: "update", // 0 ->  event
//             alphas: gradWeights[0].dataSync(), // 1 ->  alphas
//             betas: gradWeights[1].dataSync(), // 2 -> betas
//             client_id: clientId,
//             model_name: "example_" + id,
//           })
//         );
//       }
//       // Set variable to false to disable weight update
//       setUpdateWeights(false);
//     }
//     console.log("[Socket]updateWeights", updateWeights);
//     if (cycle <= stopAfter && updateWeights == true) {
//       updateNewWeights();
//     }

//     if (cycle >= stopAfter) {
//       console.log("[Socket]End of training");
//       socket.send(
//         JSON.stringify({
//           event: "end-of-training", // 0 ->  event
//           client_id: clientId,
//         })
//       );
//     }
//   }, [updateWeights]);

//   useEffect(() => {
//     let client_preferences = clientPreferences(
//       noOfClients,
//       probIdx,
//       META_DATA[id].change_prob_idxs,
//       META_DATA[id].change_probs
//     );
//     console.log("[Socket]Client Preference", client_preferences);
//     setPolicies(generatePolicies(noOfClients, dim, client_preferences));

//     if (simulate == false) {
//       // When the user doesn't make a decision for 20 seconds, closes the window, or presses X... send a negative result
//       const timer = setTimeout(submitNegativeResult, 20000);
//       window.addEventListener("beforeunload", submitNegativeResult);
//       document.addEventListener("keyup", (e) => {
//         if (e.code === "KeyX") submitNegativeResult();
//       });

//       return () => clearTimeout(timer);
//     }
//   }, []);

//   useEffect(() => {
//     setOptions(Object.keys(uiOptions).length);
//     console.log("[Socket]Policies", policies);
//   }, [policies]);

//   useEffect(() => {
//     if (endCycle == true) {
//       setCycle(cycle + 1);
//       console.log("[Socket]New cycle", cycle);
//       console.log("[Socket]Client Id", clientId);
//     }
//   }, [endCycle]);

//   useEffect(() => {
//     // Change client preference to option highestValueIndex
//     let client_preferences = clientPreferences(
//       noOfClients,
//       probIdx,
//       META_DATA[id].change_prob_idxs,
//       META_DATA[id].change_probs
//     );
//     setPolicies(generatePolicies(noOfClients, dim, client_preferences));
//   }, [probIdx]);

//   useEffect(() => {
//     if (changePolicy == true && cycle == updatePoliciesAfter) {
//       console.log("[Socket]Policy Changed", changePolicy);
//       console.log("[Socket]Policies", policies);
//       setProbIdx(probIdx + 1);
//     }
//   }, [cycle]);

//   // Take initial action on weights received from the server
//   useEffect(() => {
//     if ((alphasArray.length == betasArray.length && cycle == 0) || endCycle) {
//       console.log("[Socket]Set end cycle to false");
//       setEndCycle(false);
//       selectSample();
//     }
//   }, [alphasArray, betasArray, policy]);

//   useEffect(() => {
//     if (options == 0) return;
//     setSocket(new WebSocket(url));
//   }, [options]);

//   useEffect(() => {
//     if (clientId == null) {
//       // let clientId = Math.floor(Math.random() * noOfClients);
//       // SetClientId(clientId);
//       SetClientId(clientid);
//       console.log("[Socket]ClientId: ", clientid);
//     }
//   }, [policies]);

//   // Set local policy
//   useEffect(() => {
//     if (clientId != null && policies != null) {
//       let local_policy = policies[clientId];
//       setPolicy(local_policy);
//       console.log("[Socket]Selected Local Policy:", local_policy);
//     }
//   }, [clientId, policies]);

//   useEffect(() => {
//     if (socket == null || clientId == null) return;
//     // Get params from server
//     socket.onopen = (message) => {
//       console.log("[Socket]Connecton Established");
//       socket.send(
//         JSON.stringify({
//           event: "connected", // 0 ->  alphas
//           client_id: clientId,
//           model_name: "example_" + id,
//         })
//       );
//     };

//     // Handle message received from server
//     socket.onmessage = (event) => {
//       const message_from_server = JSON.parse(event.data);
//       let dim_from_server = null,
//         no_of_clients = null;
//       console.log("[Socket]Message Received", message_from_server);

//       // Sets params with the value received from the server
//       if (message_from_server["type"] == "init-params") {
//         dim_from_server = message_from_server.params["dim"];
//         no_of_clients = message_from_server.params["max_workers"];

//         // Set the values
//         if (dim_from_server == dim && noOfClients == no_of_clients) {
//           console.log("[Socket]Valid dimension");

//           console.log(
//             "[Socket]INIT - Received aplhas betas dim policy",
//             message_from_server.params["al"],
//             message_from_server.params["bt"],
//             dim_from_server,
//             message_from_server.params["max_workers"]
//           );
//           setAlphasArray(message_from_server.params["al"]);
//           setBetasArray(message_from_server.params["bt"]);
//         } else {
//           console.log("[Socket]Dimension does not match. ");
//         }
//       } else if (message_from_server["type"] == "new_weights") {
//         console.log(
//           "************* [Socket]Received New Weights & Cycle ********************",
//           message_from_server.params["al"],
//           message_from_server.params["bt"],
//           message_from_server.params["cycle"]
//         );
//         setEndCycle(true);
//         setAlphasArray(message_from_server.params["al"]);
//         setBetasArray(message_from_server.params["bt"]);
//       }
//     };
//   }, [socket]);

  return (
    <>
      <div id='main'>
        <ErrorBoundary>
          <UIClient
            config={config}
            handleUserClick={submitPositiveResult}
          ></UIClient>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default WebClientPage;
