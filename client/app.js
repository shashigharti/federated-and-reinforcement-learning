import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MainPage, AdminPage, BookClientPage, UIClientPage } from "./src";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route exact path='/' element={<MainPage />} />
          <Route exact path='/admin' element={<AdminPage />} />
          <Route exact path='/book-client' element={<BookClientPage />} />
          <Route exact path='/ui-client' element={<UIClientPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
