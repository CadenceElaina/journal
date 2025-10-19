import React, { useState } from "react";
import Header from "../components/common/Header";
import Login from "./Login";

const Home = () => {
  const [auth, setAuth] = useState(false);
  return (
    <>
      dashboard
      <div>{!auth && <Login />}</div>
    </>
  );
};

export default Home;
