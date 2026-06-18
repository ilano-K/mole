import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css"; // <--- THIS IS THE MAGIC LINE YOU ARE MISSING!

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
