import "./index.css";            // ← add this as the first import
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./AppNew";

createRoot(document.getElementById("root")!).render(<App />);
