import React, { useState } from "react";
import Header from "../components/common/Header";
import Login from "./Login";
import { useAuth } from "../features/auth/context/AuthContext";

const Home = () => {
  const { status } = useAuth(); // Add () to call the hook

  return (
    <>
      dashboard
      <div>{status === "loggedOut" && <Login />}</div>
    </>
  );
};

export default Home;
