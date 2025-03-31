import { createRoot } from 'react-dom/client'
import './styles/main.css'
import App from './App.tsx'

// Create root and render App without StrictMode for debugging
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found!");
}
