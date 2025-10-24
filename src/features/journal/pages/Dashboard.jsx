import React from "react";
import Login from "../../auth/pages/Login";
import { useAuth } from "../../auth/context/AuthContext";

const Dashboard = () => {
  const { status } = useAuth();

  return (
    <>
      <div>dashboard</div>
      <div>{status === "loggedOut" && <Login />}</div>
    </>
  );
};

export default Dashboard;
