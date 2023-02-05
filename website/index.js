// Import core dependencies
import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import UIClient from './uiclient';
import ErrorBoundary from "./errorboundary";
import {
    argMax,
    simulate,
    clientPreferences,
    generatePolicies,
    ALL_UIOPTIONS,
    META_DATA
  } from "./common";
const { jStat } = require("jstat");

const UIClientPage = () => {
    const [cycle, setCycle] = useState(0);
    const [exampleId] = useState(6); 
    const [probIdx] = useState(0); // It increases by 1 unit if the policy change is set to true
    const [noOfClients] = useState(1);    
    const [dim] = useState(24);       
    const [clientId] = useState(0);     
    const [policies, setPolicies] = useState([]);    
    const [simulation] = useState(true);
    const [policy, setPolicy] = useState([]);
    const [config, setConfig] = useState(ALL_UIOPTIONS[0]);
    const [selectedOption, setSelectedOption] = useState(0);
    const [betaDistribution, setBetaDistribution] = useState([]);
    const [alphasArray, setAlphasArray] = useState([]);
    const [betasArray, setBetasArray] = useState([]);    
    const [newReward, setNewReward] = useState(0);    
    const [step, setStep] = useState(1);        
    const stopAfter = 100;
    const [allRewards, setAllRewards] = useState({}); 
    const webelem = document.getElementById("root");

    /**
     * Choose the best option(with highest reward probability) among other various options;
     * random probability using beta distribution
     */
    const calAndSetBetaDistribution = () => {
        if (alphasArray.length < 1 || betasArray.length < 1)
            return;
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
    
    const fetchParamFromServer = async () => {
        const response = await fetch(`http://localhost:8082/api/trainings/6`);
        return await response.json();   
    }

    const resetParams = () => {           
        console.log("[Website]Fetching Params from the Server!");
        fetchParamFromServer().then((data) => {
            console.log("[Website] Response from server", data)     
            let new_alphas = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                new_betas = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            if (data.length > 0) {
                new_alphas = data[0]["end_alphas"].split(",").map(v => Number(v)),
                    new_betas = data[0]["end_betas"].split(",").map(v => parseFloat(v)); 
                console.log("[Website] From Server Alphas Array", new_alphas);
                console.log("[Website] From Server Betas Array", new_betas);
            }
            console.log("[Website] New alphas, Betas", new_alphas, new_betas);
            setAlphasArray(new_alphas);
            setBetasArray(new_betas);
          });
        
    }  
    useEffect(() => {
        let webelem = document.getElementById("root");
        webelem.addEventListener('useraction', function(_)        {
            console.log("[Website]Simulate user Action, useraction event raised !!!!! from content script");
            // webelem.setAttribute('data-waiting', 0);            
            setStep(10)            
        });
        webelem.addEventListener('newcycle', function(e)        {
            console.log("[Website]Restart Cycle, 'newcycle' event raised!!! from content script");
            console.log("[Website]Params from Content Script", e.detail)
            setStep(1)            
        });
        let rewards = {};
        for (let i = 0; i < 24; i++){
            rewards[i] = {0:0, 1:0}
        }
        setAllRewards(rewards)
    }, []);

    // This code will run first => step 1
    useEffect(() => {
        if (step != 1) return;   
        console.log("================================[Website]Selecting new Sample====================================", cycle);     
        let webelem = document.getElementById("root");
        console.log("[Website]Cycle", cycle);
        console.log("[Website]data-value", webelem.getAttribute("data-cycle"));
        let client_preferences = clientPreferences(
            noOfClients,
            probIdx,
            META_DATA[exampleId].change_prob_idxs,
            META_DATA[exampleId].change_probs
        );   
        console.log("[Website]Step 1 - Initialization");
        console.log("[Website]Client Preferences", client_preferences);
        setPolicies(generatePolicies(noOfClients, dim, client_preferences));
        setStep(2);
    }, [step]);

    // step 2
    useEffect(() => {
        if (step != 2) return;
        if (exampleId.length < 1 || policies == null || policies.length < 1) return;

        console.log("[Website]Step 2 - Set Policies");   
        console.log("[Website]Step 2 - Resetting Params");           
        resetParams();  
        setPolicy(policies[clientId]); 
        setStep(3)       
    }, [clientId, policies, step]);    

    // step 3
    useEffect(() => {    
        if (betasArray.length < 1 || alphasArray.length < 1) return;
        console.log("[Website]Step 3 - Calculate Beta Distribution");
        calAndSetBetaDistribution();
        setConfig(ALL_UIOPTIONS[selectedOption]);
        setStep(4)
    },[betasArray]);

    // step 4
    useEffect(() => {   
        if(step != 4) return 
        if (betasArray.length < 1 || alphasArray.length < 1) return;        
        if (betaDistribution.length < 1) return;
        if (policy == null || policy.length < 1) return;
        console.log("[Website]Step 4 - Initialization Complete");
        setStep(5)
    },[betasArray, policy, betaDistribution, config, step]);


    // Once initial variables are initialized => step 5
    useEffect(() => {
        if (step != 5) return; 
        console.log("[Website]Step 5 - Initial Value");   
        console.log("           [Website]ExampleId", exampleId);   
        console.log("           [Website]Cycle", cycle);   
        console.log("           [Website]ClientId", clientId); 
        console.log("           [Website]NoOfClients", noOfClients);
        console.log("           [Website]Dim", dim);
        console.log("           [Website]Simulation", simulation);
        console.log("           [Website]AlphasArray:", alphasArray); 
        console.log("           [Website]BetasArray:", betasArray); 
        console.log("           [Website]Selected Policy:", policy); 
        console.log("           [Website]Beta Distribution:", betaDistribution); 
        console.log("           [Website]New Config:", config)
        console.log("           [Website]Rewards:", allRewards)
        setStep(6)
    }, [step]);


    // step 6
    useEffect(() => {
        if (step != 6) return; 
        if (cycle >= stopAfter) {
            console.log("[Website]All reward", allRewards);
            return;
        }

        console.log("[Website]Step 6 - Select Option"); 
        console.log("[Website]Beta Distribution:", betaDistribution); 
        const selected_option = argMax(betaDistribution);
        document.getElementById("root").setAttribute("data-option", selected_option);
        console.log("[Website]Old option:", selectedOption);   
        console.log("[Website]New option selected:", selected_option);
        setSelectedOption(selected_option); 

        // if same option is selected react doesn't raise selectedOption event
        // to handle this we will trigger  user event from here.
        if (selected_option == selectedOption){            
            console.log("[Website]Same option selected, end cycle"); 
            console.log("[Website]New Reward", newReward); 
            // End the cycle assuming same action from user (as before) and wait user action, it has to trigger button click
        }
        setStep(7)
    }, [step]);

    // step 7
    useEffect(() => {   
        if (step != 7) return; 

        console.log("[Website]Step 7 - Change User Display"); 
        setConfig(ALL_UIOPTIONS[selectedOption]);  
        setStep(8)
    }, [selectedOption, step]); 

    // step 8
    useEffect(() => {
        if (step !=8) return; 
        console.log("[Website]Step 8 - Predict New Reward"); 
        console.log("[Website]New Config:", config)
        console.log("[Website]Policy:", policy); 
        if (simulation){
            // If simulation is true, simulate the user action
            let new_reward = simulate(policy, selectedOption);  
            console.log("[Website]New Reward Selected", newReward);        
            setNewReward(new_reward);             
            if(newReward === new_reward){
                console.log("[Website]Same reward, end cycle");  
            }
            webelem.setAttribute("data-reward", new_reward);
        }  
        setStep(9)
    }, [step]);

    // step 9
    useEffect(() => {
        if (step !=9) return; 
        let rewards = {...allRewards}
        // if (!rewards[selectedOption]) rewards[selectedOption] = {0: 0, 1: 0}
        rewards[selectedOption][newReward] += 1        
        setAllRewards(rewards)
        let webelem = document.getElementById("root");
        webelem.setAttribute('data-waiting', 1);  
        setCycle(cycle + 1);        
    }, [step]);


    // step 10 - It is triggered by button click in 'UIClient'
    useEffect(() => {
        let webelem = document.getElementById("root");
        let contentCycle = parseInt(webelem.getAttribute("data-cycle"));
        if (step != 10) return; 
        if (cycle === contentCycle) return;               
        webelem.setAttribute('data-waiting', 0);  
    }, [step]);

    // Handle user's Positive Response => step 10
    const submitPositiveResult = (e) => {
        if (step != 10) return; 

        console.log("[Website]Step 10 - User Action Accepted"); 
        if (!simulation){
            setNewReward(1);   
            webelem.setAttribute("data-reward", 1);       
        }  
    };

    // Handle user's Negative Response => step 10
    const submitNegativeResult = (e) => {
        if (step != 10) return; 

        console.log("[Website]Step 10 - User Action Rejected"); 
        if (newReward == 1) return;
        if (!simulation){
            setNewReward(0);
            webelem.setAttribute("data-reward", 0);
        }
    }

    return (
        <>
          <div id='main'>           
              <UIClient
                config={config}
                handleUserAccept={submitPositiveResult}   
                handleUserReject={submitNegativeResult}
                newReward={newReward}       
                step={step}     
                cycle={cycle}
                selectedOption={selectedOption}     
              ></UIClient>
          </div>
        </>
    );
}
ReactDOM.render(
    <>
        <ErrorBoundary>
            <UIClientPage />
        </ErrorBoundary>
    </>,
    document.getElementById("root")
);
  