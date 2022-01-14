import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MainPage, AdminPage, ClientPage } from "./src";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route exact path='/' element={<MainPage />} />
          <Route exact path='/admin' element={<AdminPage />} />
          <Route exact path='/client' element={<clientPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
