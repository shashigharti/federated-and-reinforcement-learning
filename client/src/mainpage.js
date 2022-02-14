import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { processPlot } from "./common";
import Plot from "react-plotly.js";
import axios from "axios";
import { BOOK_TYPES, OPTION_TYPES } from "./data";

const MainPage = () => {
  let [models, setModels] = useState([]);
  let [training_cycle, setTrainingCycle] = useState([]);
  let [plotdata, setPlotData] = useState([]);
  let [training_cycle_details, setTrainingCycleDetails] = useState([]);
  const [maxvalue, setMaxValue] = React.useState(500);
  const [value, setValue] = React.useState(0);
  const [modelType, setModelType] = React.useState("");

  const getModels = () => {
    axios
      .get("http://" + process.env.API_ENDPOINT + "/api/models")
      .then((response) => {
        // handle success
        response.data = response.data.map((item) => ({
          ...item,
          client_type:
            item.model_name === "example_2" ? "ui-client" : "book-client",
        }));
        setModels(response.data);
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
  };
  const getTrainingData = ($model_id) => {
    axios
      .get("http://" + process.env.API_ENDPOINT + "/api/trainings/" + $model_id)
      .then((response) => {
        // handle success
        setTrainingCycle(response.data);
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
    setModelType($model_id == 2 ? "ui-client" : "book-client");
  };

  const handleSliderChange = ($slider_value) => {
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
    if (modelType == "ui-client") {
      setPlotData(processPlot(alphas, betas, OPTION_TYPES));
    } else {
      setPlotData(processPlot(alphas, betas, BOOK_TYPES));
    }
  };
  const getTrainingCycleDetailsData = ($training_cycle_id) => {
    axios
      .get(
        "http://" +
          process.env.API_ENDPOINT +
          "/api/trainings/" +
          $training_cycle_id +
          "/cycle_details/"
      )
      .then((response) => {
        setMaxValue(response.data.length);
        setTrainingCycleDetails(response.data);
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
  };

  useEffect(() => {
    getModels();
  }, []);
  return (
    <>
      {/* <TabMenu /> */}
      <div className='row'>
        <div className='col s12 m6'>
          <h2> Models </h2>
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Model Name</th>
                <th>Alphas</th>
                <th>Betas</th>
                <th>Status</th>
                <th>Dimension/Options</th>
                <th>Max No. of Users</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.id}>
                  <td>{model.id}</td>
                  <td>{model.model_name}</td>
                  <td>{model.alphas}</td>
                  <td>{model.betas}</td>
                  <td>{model.status}</td>
                  <td>{model.options}</td>
                  <td>{model.max_workers}</td>
                  <td>
                    <div>
                      <Link
                        className='btn waves-effect waves-light'
                        to={"/" + model.client_type}
                        target={"_blank"}
                      >
                        Start Client
                        <i className='material-icons right'>arrow_forward</i>
                      </Link>
                    </div>
                    <br />
                    <div>
                      <button
                        className='btn waves-effect waves-light'
                        onClick={() => getTrainingData(model.id)}
                      >
                        Trainings
                        <i className='material-icons right'>arrow_forward</i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='col s12 m6'>
          <h2> Training Cycle </h2>
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Model id</th>
                <th>Start alphas</th>
                <th>End alphas</th>
                <th>Start beta</th>
                <th>End beta</th>
                <th>Cycle status</th>
                <th>No of workers</th>
                <th>Total rounds</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {training_cycle.map((training_cycle) => (
                <tr key={training_cycle.id}>
                  <td>{training_cycle.id}</td>
                  <td>{training_cycle.server_data}</td>
                  <td>{training_cycle.start_alphas}</td>
                  <td>{training_cycle.end_alphas}</td>
                  <td>{training_cycle.start_betas}</td>
                  <td>{training_cycle.end_betas}</td>
                  <td>{training_cycle.cycle_status}</td>
                  <td>{training_cycle.n_worker_participated}</td>
                  <td>{training_cycle.rounds}</td>
                  <td>
                    <button
                      className='btn waves-effect waves-light'
                      onClick={() =>
                        getTrainingCycleDetailsData(training_cycle.id)
                      }
                    >
                      Show Plot
                      <i className='material-icons right'>insert_chart</i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className='row'>
        <div className='col s12 m12'>
          <h2>Plot</h2>
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
