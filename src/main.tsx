import ReactDOM from "react-dom/client";

import { store } from "./store/store";
import { Provider } from "react-redux";
import GameViewer from "./GameViewer";
import {
  Route,
  HashRouter,
  Routes
} from "react-router-dom";
import PlayerMenu from "./pages/PlayerMenu";
import Player from "./pages/Player";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
    <HashRouter>
      <Routes>
        <Route path="/" element={<PlayerMenu />} />
        <Route path="/player/:id" element={<Player />} />
      </Routes>
    </HashRouter>
  </Provider>
);
