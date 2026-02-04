import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { PlaaceFilterProvider } from "./context/PlaaceFilterContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlaaceFilterProvider>
      <App />
    </PlaaceFilterProvider>
  </StrictMode>,
);
