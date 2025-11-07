import React from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Layout } from "./components/Layout";
import OeeDashboard from "./pages/OeeDashboard";
import HistoryPage from "./pages/HistoryPage";
import LinesPage from "./pages/LinesPage";
import ProductionRecordForm from "./pages/ProductionRecordForm";
import ProductionRecordFormV2 from "./pages/ProductionRecordFormV2";
import OeeDashboardV2 from "./pages/OeeDashboardV2";
import HistoryPageV2 from "./pages/HistoryPageV2";
import IntegrationsPanel from "./pages/IntegrationsPanel";
import DemoSchaeffler from "./pages/DemoSchaeffler";
import DemoSpada from "./pages/DemoSpada";
import NotFound from "./pages/NotFound";

// App component with LanguageProvider at the root
const App = () => {
  return (
    <LanguageProvider>
      <TooltipProvider>
        <Sonner />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Layout><OeeDashboardV2 /></Layout>} />
          <Route path="/dashboard-v1" element={<Layout><OeeDashboard /></Layout>} />
          <Route path="/record" element={<Layout><ProductionRecordFormV2 /></Layout>} />
          <Route path="/record-v1" element={<Layout><ProductionRecordForm /></Layout>} />
          <Route path="/history" element={<Layout><HistoryPageV2 /></Layout>} />
          <Route path="/history-v1" element={<Layout><HistoryPage /></Layout>} />
          <Route path="/integrations" element={<Layout><IntegrationsPanel /></Layout>} />
          <Route path="/lines" element={<Layout><LinesPage /></Layout>} />
          <Route path="/demo/schaeffler" element={<Layout><DemoSchaeffler /></Layout>} />
          <Route path="/demo/spada" element={<Layout><DemoSpada /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </LanguageProvider>
  );
};

export default App;
