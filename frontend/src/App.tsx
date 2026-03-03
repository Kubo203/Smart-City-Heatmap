import "leaflet/dist/leaflet.css";
import { Outlet } from "react-router-dom";
import Dashboard from "./components/custom/Dashboard";

function App() {
  return (
    <div className="h-screen w-full relative flex flex-col">
      <Dashboard />
      <Outlet />
    </div>
  );
}

export default App;
