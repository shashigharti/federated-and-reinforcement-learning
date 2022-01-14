import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { FirstPage } from "./src";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<MainPage />} />
          <Route path='/admin' element={<AdminPage />} />
          <Route path='/client-ui' element={<ClientPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
