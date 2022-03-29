import React, { useState, useEffect } from "react";
const { jStat } = require("jstat");
import {
  argMax,
  simulate,
  generatePolicies,
  clientPreferences,
} from "./../common";
import { META_DATA, ALL_UIOPTIONS } from "./../data";
import UIClient from "./../components/uiclient";
import ErrorBoundary from "./../components/errorboundary";
import axios from "axios";
import { useParams } from "react-router-dom";

const UIClientPage = () => {
  const { id, clientid } = useParams();
  const [clientId] = useState(clientid);
  const simulation = true;
  const dim = META_DATA[id].dim;

  // Features/parameters that determine the users action
  const [alphasArray, setAlphasArray] = useState([]);
  const [betasArray, setBetasArray] = useState([]);
  const [betaDistribution, setBetaDistribution] = useState([]);
  const [config, setConfig] = useState(ALL_UIOPTIONS[0]);
  const [policies, setPolicies] = useState([]);
  const [probIdx, setProbIdx] = useState(0);

  // User options : 24 different ui design
  const [uiOptions] = useState(ALL_UIOPTIONS);
  const [selectedOption, setSelectedOption] = useState(0);
  const noOfClients = META_DATA[id].no_of_clients;

  const getTrainingData = ($model_id) => {
    console.log(
      "=====================================================[UI-ClientPage]Get training Data for model_id============================================",
      $model_id
    );
    axios
      .get(process.env.API_ENDPOINT + "/api/trainings/" + $model_id, config)
      .then((response) => {
        console.log("[UI-ClientPage]Received model from the server.");
        let alphas = response.data[response.data.length - 1].end_alphas
            .split(",")
            .map(Number),
          betas = response.data[response.data.length - 1].end_betas
            .split(",")
            .map(Number);
        setAlphasArray(alphas);
        setBetasArray(betas);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // When the user clicks the button...
  const submitPositiveResult = (e) => {
    console.log("[UI-ClientPage]User clicked");
    // Pull model from web API, Set alpha, betas and select sample
    // getTrainingData(id, META_DATA[id].base_url);
    window.location.reload(false);
  };

  // When the user doesn't click the button...
  const submitNegativeResult = (e) => {
    console.log("[UI-ClientPage]Did not Click");
    // Pull model from web API, Set alpha, betas and select sample
    // getTrainingData(id, META_DATA[id].base_url);
    window.location.reload(false);
  };

  // Choose the best option(with highest reward probability) among other various options;
  // Random probability using beta distribution
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
    console.log("[UI-ClientPage]Beta Distribution", betaDistribution);
    if (betaDistribution.length > 0) {
      // Random selection of option from available ones
      let selected_option = argMax(betaDistribution);
      setSelectedOption(selected_option);
      console.log("[UI-ClientPage]New option selected:", selected_option);

      // Changed selected option
      console.log("[UI-ClientPage]Update selected option", selectedOption);

      // Change user display
      setConfig(uiOptions[selectedOption]);

      // Changed selected option
      console.log("[UI-ClientPage]config", config);
      let new_reward = 0;
      if (simulation == true) {
        let local_policy = policies[clientId];
        new_reward = simulate(local_policy, selectedOption);
        console.log("[UI-ClientPage]New Reward", new_reward);

        if (new_reward == 1) {
          console.log("[UI-ClientPage]Trigger Click Event");
          document.querySelector("Button").click();
        }
      }

      if (new_reward == 0) {
        console.log("[UI-ClientPage]Set timer");
        // When the user doesn't make a decision for 20 seconds, closes the window, or presses X... send a negative result
        const timer = setTimeout(submitNegativeResult, 20000);
        return () => clearTimeout(timer);
      }
    }
  }, [betaDistribution]);

  useEffect(() => {
    if (
      betasArray.length <= 0 ||
      alphasArray.length <= 0 ||
      alphasArray.length !== betasArray.length
    )
      return;
    console.log("[UI-ClientPage]Selecting sample");
    selectSample();
  }, [alphasArray, betasArray]);

  useEffect(() => {
    console.log("[UI-ClientPage]Policies", policies);
  }, [policies]);

  useEffect(() => {
    let client_preferences = clientPreferences(
      noOfClients,
      probIdx,
      META_DATA[id].change_prob_idxs,
      META_DATA[id].change_probs
    );
    console.log("[UI-ClientPage]Client Preference", client_preferences);
    setPolicies(generatePolicies(noOfClients, dim, client_preferences));
  }, [probIdx]);

  useEffect(() => {
    console.log("[UI-ClientPage]Client Id", clientId);
    console.log("[UI-ClientPage]Dim", dim);
    console.log("[UI-ClientPage]Simulation", simulation);
    // Pull model from web API, Set alpha, betas and select sample
    getTrainingData(id, META_DATA[id].base_url);
  }, []);

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

export default UIClientPage;
