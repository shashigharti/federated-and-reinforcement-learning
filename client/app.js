import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MainPage, AdminPage, BookClientPage, UIClientPage } from "./src";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<MainPage />} />
          <Route path='/admin' element={<AdminPage />} />
          <Route path='/book-client' element={<BookClientPage />} />
          <Route path='/ui-client' element={<UIClientPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
