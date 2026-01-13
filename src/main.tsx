import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { testDatabaseConnection } from "./lib/supabase";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  
  // Upraszczamy inicjalizację, aby uniknąć blokowania renderowania przez testy połączenia
  // Błędy połączenia będą teraz obsługiwane przez AuthContext i Sonner.
  root.render(<App />);
}