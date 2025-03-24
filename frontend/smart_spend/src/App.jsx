import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import Home from "./pages/dashboard/Home";
import Income from "./pages/dashboard/Income";
import Expense from "./pages/dashboard/Expense";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Root />}></Route>
          <Route path="/login" exact element={<Login />}></Route>
          <Route path="/signUp" exact element={<SignUp />}></Route>
          <Route path="/dashboar" exact element={<Home />}></Route>
          <Route path="/income" exact element={<Income />}></Route>
          <Route path="/expense" exact element={<Expense />}></Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;

const Root = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated? (<Navigate to="/dashboard"/>) : (<Navigate to="/login"/>)
};
