// Install auth circuit breaker fetch patch before any Supabase import
import "./lib/authCircuitBreaker";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
