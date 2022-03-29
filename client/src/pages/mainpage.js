import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { processPlot } from "./../common";
import Plot from "react-plotly.js";
import axios from "axios";
import { META_DATA, BOOK_TYPES, OPTION_TYPES, WEB_OPTIONS } from "../data";

const MainPage = () => {
  let [models, setModels] = useState([]);
  let [training_cycle, setTrainingCycle] = useState([]);
  let [plotdata, setPlotData] = useState([]);
  let [training_cycle_details, setTrainingCycleDetails] = useState([]);
  const [maxvalue, setMaxValue] = React.useState(500);
  const [value, setValue] = React.useState(0);
  const [modelType, setModelType] = React.useState("");
  const [activeModelId, setActiveModelId] = React.useState(null);
  const [activeTrainingCycleId, setActiveTrainingCycleId] =
    React.useState(null);
  const [activeClients, setActiveClients] = React.useState([]);
  const [isTraining, setIsTraining] = React.useState(false);

  let config = {
    // headers: { "Access-Control-Allow-Origin": "*" },
  };

  const getModels = () => {
    axios
      .get(process.env.API_ENDPOINT + "/api/models", config)
      .then((response) => {
        response.data = response.data.map((item) => {
          if (activeModelId == item.id && item.status != "training") {
            setIsTraining(false);
          }

          return {
            ...item,
            client_type: META_DATA[item.id].has_nested_route
              ? META_DATA[item.id].base_url + "/" + item.id
              : META_DATA[item.id].base_url,
          };
        });
        response.data;
        setModels(response.data);
        if (activeModelId != null) {
          getTrainingData(activeModelId, META_DATA[activeModelId].base_url);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSliderChange = ($slider_value) => {
    if (training_cycle_details.length <= 0) return;

    setValue($slider_value);
    let params = JSON.parse(training_cycle_details[$slider_value]["params"]);
    let alphas, betas;
    alphas = params["alphas"].split(",");
    betas = params["betas"].split(",");
    alphas = alphas.map(function (x) {
      return parseFloat(x, 10);
    });
    betas = betas.map(function (x) {
      return parseFloat(x, 10);
    });

    if (modelType == "book-client") {
      setPlotData(processPlot(alphas, betas, BOOK_TYPES));
    } else if (modelType == "ui-client") {
      setPlotData(processPlot(alphas, betas, OPTION_TYPES));
    } else {
      setPlotData(processPlot(alphas, betas, WEB_OPTIONS));
    }
  };

  const getTrainingData = ($model_id, $model_url = "book-client") => {
    console.log("[Socket] Get training Data for model_id =>", $model_id);
    setActiveModelId($model_id);
    axios
      .get(process.env.API_ENDPOINT + "/api/trainings/" + $model_id, config)
      .then((response) => {
        if (response.data.length > 0) {
          setActiveTrainingCycleId(response.data[response.data.length - 1].id);
        }
        setTrainingCycle(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    setModelType($model_url);
  };

  const getTrainingCycleDetailsData = ($training_cycle_id) => {
    if ($training_cycle_id == null) return;
    console.log(
      "[Socket] Get training Cycle Details Data for training_cycle_id =>",
      $training_cycle_id
    );
    axios
      .get(
        process.env.API_ENDPOINT +
          "/api/trainings/" +
          $training_cycle_id +
          "/cycle_details/",
        config
      )
      .then((response) => {
        setActiveTrainingCycleId($training_cycle_id);
        setMaxValue(response.data.length);
        setTrainingCycleDetails(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const deleteTrainingCycle = ($training_cycle_id) => {
    axios
      .delete(
        process.env.API_ENDPOINT +
          "/api/trainings/" +
          $training_cycle_id +
          "/delete",
        config
      )
      .then((response) => {
        getTrainingData(activeModelId, META_DATA[activeModelId].base_url);
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
  };

  const updateModel = (model_id, client_id, max_no_of_users) => {
    console.log("[React UI]Active Clients", [...activeClients, client_id]);
    if (activeClients.indexOf(client_id) == -1) {
      setActiveClients([...activeClients, client_id]);
    }

    if (activeClients <= max_no_of_users) {
      setIsTraining(true);
    }

    if (activeModelId != model_id) {
      setActiveModelId(model_id);
    }
  };

  useEffect(() => {
    handleSliderChange(maxvalue - 1);
  }, [training_cycle_details]);

  useEffect(() => {
    getTrainingCycleDetailsData(activeTrainingCycleId);
  }, [training_cycle]);

  useEffect(() => {
    if (activeModelId != null) {
      getTrainingData(activeModelId, META_DATA[activeModelId].base_url);
    }
  }, [activeModelId]);

  useEffect(() => {
    console.log("[Socket]isTraining", isTraining);
    if (isTraining) {
      const timer = setTimeout(() => {
        console.log("get models");
        getModels();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTraining, models]);

  useEffect(() => {
    getModels();
  }, []);

  return (
    <>
      <div className='row'>
        <div className='col s12 m5'>
          <h5> Models </h5>
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Model Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr
                  key={model.id}
                  className={`${
                    activeModelId == model.id ? "card-panel teal lighten-2" : ""
                  }`}
                >
                  <td>{model.id}</td>
                  <td>
                    <b>Type:</b>
                    {META_DATA[model.id].base_url}
                    <br />
                    <b>Description:</b>
                    {META_DATA[model.id].description}
                    <br />
                    <b>Model Name:</b>
                    {model.model_name}
                    <br />
                    <b>Alphas:</b> {model.alphas} <br />
                    <b>Betas:</b> {model.betas} <br />
                    <b>Options:</b>
                    {model.options} &nbsp; &nbsp;
                    <b>Max_workers:</b>
                    {model.max_workers} &nbsp; &nbsp;
                    <b>Status:</b> {model.status}
                    {isTraining && activeModelId == model.id ? (
                      <div className='progress'>
                        <div className='indeterminate'></div>
                      </div>
                    ) : (
                      ""
                    )}
                  </td>
                  <td>
                    {[...Array(model.max_workers).keys()].map((idx) => (
                      <div key={"btn" + idx}>
                        <Link
                          to={"/" + model.client_type + "/" + idx}
                          onClick={() =>
                            updateModel(model.id, idx, model.max_workers)
                          }
                          target={"_blank"}
                        >
                          Start Client{idx}
                        </Link>
                        <br />
                      </div>
                    ))}
                    <hr />
                    <div>
                      <button
                        onClick={() =>
                          getTrainingData(
                            model.id,
                            META_DATA[model.id].base_url
                          )
                        }
                      >
                        Training Data
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className='visualization__training-data col s12 m6'
          style={{ height: "350px", overflow: "scroll" }}
        >
          <h5> Training Cycle </h5>
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {training_cycle.map((training_cycle) => (
                <tr key={training_cycle.id}>
                  <td>{training_cycle.id}</td>
                  <td>
                    <b>Model Id:</b>
                    {training_cycle.server_data} <br />
                    <b>Start Alphas:</b>
                    {training_cycle.start_alphas} <br />
                    <b>End Alphas:</b>
                    {training_cycle.end_alphas} <br />
                    <b>Start Betas:</b>
                    {training_cycle.start_betas} <br />
                    <b>End Betas:</b>
                    {training_cycle.end_betas}
                    <br />
                    <b>Cycle Status:</b>
                    {training_cycle.cycle_status} &nbsp; &nbsp;
                    <b>Training Cycle:</b>
                    {training_cycle.rounds} &nbsp; &nbsp;
                    <b>Worker Participated:</b>
                    {training_cycle.n_worker_participated}
                  </td>
                  <td>
                    <button
                      id='btn__showplot'
                      onClick={() =>
                        getTrainingCycleDetailsData(training_cycle.id)
                      }
                    >
                      Show
                    </button>
                    <button
                      onClick={() => deleteTrainingCycle(training_cycle.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='col s6 m6'>
          <h5>Plot</h5>
          <Plot data={plotdata} layout={{ title: "Distribution Plot" }} />
          <input
            id='typeinp'
            type='range'
            min='0'
            max={maxvalue}
            value={value}
            onChange={(e) => handleSliderChange(e.target.value)}
            step='1'
          />
          {value}
        </div>
      </div>
    </>
  );
};
export default MainPage;
