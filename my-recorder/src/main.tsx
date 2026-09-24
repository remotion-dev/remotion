import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { DevicePermission } from "./DevicePermission";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DevicePermission>
      <App />
    </DevicePermission>
  </React.StrictMode>,
);
