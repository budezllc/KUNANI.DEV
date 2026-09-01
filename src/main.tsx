import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "lenis/dist/lenis.css";
import "./index.css";
import App from "./App.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("#root missing");
root.replaceChildren();
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
