import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Track cursor position for CSS custom cursor dot
document.addEventListener("mousemove", (e) => {
  document.body.style.setProperty("--cx", `${e.clientX}px`);
  document.body.style.setProperty("--cy", `${e.clientY}px`);
});

createRoot(document.getElementById("root")!).render(<App />);
