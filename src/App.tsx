import React from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import OeeDashboard from "./pages/OeeDashboard";
import HistoryPage from "./pages/HistoryPage";
import LinesPage from "./pages/LinesPage";
import ProductionRecordForm from "./pages/ProductionRecordForm";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Sonner />
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Layout><OeeDashboard /></Layout>} />
      <Route path="/record" element={<Layout><ProductionRecordForm /></Layout>} />
      <Route path="/history" element={<Layout><HistoryPage /></Layout>} />
      <Route path="/lines" element={<Layout><LinesPage /></Layout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
