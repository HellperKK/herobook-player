import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import GameViewer from "./GameViewer";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GameViewer />
  </React.StrictMode>
);
