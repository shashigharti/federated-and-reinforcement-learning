// Import core dependencies
import React from 'react';
import { render, hydrate } from 'react-dom';
import App from './app.js';

// Create a reward and sample vector
let rewardVector;
let sampledVector;
let selectedOption;
let alphasArray, betasArray;

// Include jStat
const { jStat } = require('jstat');

// Define grid connection parameters
const url = 'ws://127.0.0.1:1234';
const modelName = 'bandit';
const modelVersion = '1.0.0';

// Status update message
const updateStatus = (message, ...args) =>
  console.log('BANDIT PLAN', message, ...args);

// All possible UI options
const allUIOptions = [
  ['black', 'gradient'], // heroBackground
  ['hero', 'vision'], // buttonPosition
  ['arrow', 'user', 'code'], // buttonIcon
  ['blue', 'white'], // buttonColor
]
  .reduce((a, b) =>
    a.reduce((r, v) => r.concat(b.map((w) => [].concat(v, w))), [])
  )
  .map(([heroBackground, buttonPosition, buttonIcon, buttonColor]) => ({
    heroBackground,
    buttonPosition,
    buttonIcon,
    buttonColor,
  }));

// User action promise, gotta wait for the user to do something!
let userActionPromiseResolve;
const userActionPromise = new Promise((resolve) => {
  userActionPromiseResolve = resolve;
});

// Has a value already been submitted?
let hasSubmittedValue = false;

// When the user clicks the button...
const submitPositiveResult = () => {
  if (!hasSubmittedValue) {
    hasSubmittedValue = true;
    userActionPromiseResolve(true);
  }
};

// When the user doesn't click the button...
const submitNegativeResult = (config) => {
  if (!hasSubmittedValue) {
    hasSubmittedValue = true;
    userActionPromiseResolve(false);
  }
};

// When the user doesn't make a decision for 20 seconds, closes the window, or presses X... send a negative result
setTimeout(submitNegativeResult, 20000);
window.addEventListener('beforeunload', submitNegativeResult);
document.addEventListener('keyup', (e) => {
  console.log(e.code)
  if (e.code === 'KeyX') submitNegativeResult();
});

// Define React root elem
const ROOT = document.getElementById('root');

// Start React
render(
  <App
    isLoaded={false}
    onButtonClick={submitPositiveResult}
    start={() => startFL(url, modelName, modelVersion)}
  />,
  ROOT
);

// Arg max function
const argMax = (d) =>
  Object.entries(d).filter(
     (el) => el[1] == Math.max(...Object.values(d))
  )[0][0];


function run_trial(){  
  // Create an array to hold samples from the beta distribution
  const samplesFromBetaDist = [];

  rewardVector = [allUIOptions.length];
  sampledVector = [allUIOptions.length];
  updateStatus(
    'Setting the reward and sampled vectors to zeros, and converting those to arrays',
    rewardVector,
    sampledVector
  );

  // For each option...
  for (let opt = 0; opt < alphasArray.length; opt++) {
    // Get a beta distribution between the alphas and betas
    samplesFromBetaDist[opt] = jStat.beta.sample(
      alphasArray[opt],
      betasArray[opt]
    );

    updateStatus('Got samples from beta distribution', samplesFromBetaDist);
  }

  // Get the option that the user should be loading...
  selectedOption = argMax(samplesFromBetaDist);
  updateStatus('Have the desired selected option', selectedOption);

  // Render that option
  hydrate(
    <App
      isLoaded={true}
      config={allUIOptions[selectedOption]}
      onButtonClick={submitPositiveResult}
      start={() => startFL(url, modelName, modelVersion)}
    />,
    ROOT
  );
  updateStatus(
    'Re-rendered the React application with config',
    allUIOptions[selectedOption]
  );    
}

// Main start method
const startFL = async (url, modelName, modelVersion) => { 

  console.log('[socket]Started!');
  const socket = new WebSocket(url);
  
  socket.addEventListener("open", function (event) {
    console.log('[socket]Connecton Established');
    socket.send(['connection', 'Connection Established']);    
  });

  socket.addEventListener("message", function (event) {
    // read alphasArray and betasArray from the server.
    updateStatus("Message received from server: ", event.data);
    const message_from_server = JSON.parse(event.data);
    if (message_from_server["type"] == "params"){
      console.log(message_from_server.params["al"], message_from_server.params["bt"])
      alphasArray = message_from_server.params["al"]
      betasArray = message_from_server.params["bt"]
      run_trial()      
    }else if(message_from_server["type"] == "updated_params"){
      newAlphas = message_from_server.params["al"];
      newBetas = message_from_server.params["bt"];

      updateStatus('Plan executed', newAlphas, newBetas);

      // Reset the old alphas and betas to the new alphas and betas
      alphas = newAlphas;
      betas = newBetas;
      updateStatus('Resetting alphas and betas', alphas, betas);

      // Finished!
      updateStatus('Cycle is done!');
    }
  });

  
  updateStatus('Waiting on user input...');

  // Wait on user input...
  const clicked = await userActionPromise;

  // If they clicked, set the reward value for this option to be a 1, otherwise it's a 0
  const reward = clicked ? 1 : 0;

  updateStatus('User input is...', clicked);

  // Set the reward and sampled vectors to be the appropriate values
  rewardVector[selectedOption] = reward;
  sampledVector[selectedOption] = 1;
  updateStatus(
    'New reward and sampled vector',
    rewardVector,
    sampledVector
  );

  socket.send(['run_plan', JSON.stringify({
    rV: rewardVector, 
    sV:sampledVector,
    al: alphasArray,
    bt: betasArray
  })]); 
  
};
