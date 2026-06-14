import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import CollectionPage from "./pages/CollectionPage.jsx";
import SwordDetailPage from "./pages/SwordDetailPage.jsx";
import ThumbnailGenerator from "./pages/ThumbnailGenerator.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/collection" element={<CollectionPage />} />
      <Route path="/sword/:slug" element={<SwordDetailPage />} />
      <Route path="/dev/thumbnails" element={<ThumbnailGenerator />} />
    </Routes>
  </BrowserRouter>,
);
