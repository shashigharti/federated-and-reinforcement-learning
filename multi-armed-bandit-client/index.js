import React from "react";
import ReactDOM from "react-dom";
import App from "./app";

const theme = {
  font: "Muli",
  fontFallback: "sans-serif",
  bodyBgColor: "#f2f4f8",
};
ReactDOM.render(
  <>
    <App />
  </>,
  document.getElementById("root")
);
