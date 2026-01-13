import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { testDatabaseConnection } from "./lib/supabase";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  
  // Testujemy połączenie przed renderowaniem, aby wyłapać błędy konfiguracji
  testDatabaseConnection().then(isConnected => {
    if (!isConnected) {
      console.error("Critical: Supabase connection failed. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      // Możesz tu zostawić renderowanie App, ale konsola powie Ci co jest źle
    }
    root.render(<App />);
  }).catch(err => {
    console.error("Failed to initialize app:", err);
    root.render(
      <div className="min-h-screen bg-lapd-navy flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg border-2 border-red-500 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Błąd Inicjalizacji</h2>
          <p className="text-gray-700 mb-6">Aplikacja nie mogła połączyć się z serwerem. Sprawdź konsolę przeglądarki (F12) oraz zmienne środowiskowe.</p>
          <button onClick={() => window.location.reload()} className="bg-lapd-navy text-white px-4 py-2 rounded">Odśwież stronę</button>
        </div>
      </div>
    );
  });
}