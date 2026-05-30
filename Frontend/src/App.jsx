import { BrowserRouter } from "react-router-dom";
import RoutesConfig from "./routes";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <RoutesConfig />
    </BrowserRouter>
  );
}

export default App;