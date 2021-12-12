import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { MainPage } from "./src";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<MainPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
