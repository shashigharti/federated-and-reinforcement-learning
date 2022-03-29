import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainPage, AdminPage, BookClientPage, UIClientPage } from "./src/pages";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MainPage />} />
          <Route path='admin' element={<AdminPage />} />
          <Route path='book-client/:id' element={<BookClientPage />} />
          <Route path='ui-client/:id/:clientid' element={<UIClientPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
