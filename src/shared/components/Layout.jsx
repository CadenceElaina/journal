import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import "../styles/Layout.css";

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        <div className="content-conatiner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
