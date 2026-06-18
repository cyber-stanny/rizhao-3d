import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import CityPage from "../pages/CityPage";
import AboutPage from "../pages/AboutPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/city" element={<CityPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
