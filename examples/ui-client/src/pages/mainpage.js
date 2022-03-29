import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { META_DATA } from "../data";

const MainPage = () => {
  let [models, setModels] = useState([]);
  React.useState(null);
  let config = {
    // headers: { "Access-Control-Allow-Origin": "*" },
  };

  const getModels = () => {
    console.log("[UI-MainPage]Get models");
    axios
      .get(process.env.API_ENDPOINT + "/api/models", config)
      .then((response) => {
        response.data = response.data.map((item) => {
          return {
            ...item,
            client_type: META_DATA[item.id].has_nested_route
              ? META_DATA[item.id].base_url + "/" + item.id
              : META_DATA[item.id].base_url,
          };
        });
        let active_models = [1, 3];
        response.data = response.data.filter(
          function callback(element, index, array) {
            if (active_models.indexOf(index) !== -1) return true;
            return false;
          },
          [active_models]
        );
        setModels(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

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
                <tr key={model.id}>
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
                  </td>
                  <td>
                    {[...Array(model.max_workers).keys()].map((idx) => (
                      <div key={"btn" + idx}>
                        <Link
                          to={"/" + model.client_type + "/" + idx}
                          target={"_blank"}
                        >
                          Start Client{idx}
                        </Link>
                        <br />
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
export default MainPage;
