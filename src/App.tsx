import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { GovernmentSchemes } from "./components/schemes/GovernmentSchemes";
import { CropTrading } from "./components/trading/CropTrading";
import { FinancialAssistance } from "./components/finance/FinancialAssistance";
import { AlertsNotifications } from "./components/notifications/AlertsNotifications";
import { WomenSchemeApplication } from "./components/special/WomenSchemeApplication";
import { WomenHealthCare } from "./components/special/WomenHealthCare";
import { WomenSchemes } from "./components/special/WomenSchemes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/schemes" element={<GovernmentSchemes />} />
          <Route path="/trading" element={<CropTrading />} />
          <Route path="/finance" element={<FinancialAssistance />} />
          <Route path="/alerts" element={<AlertsNotifications />} />
          <Route path="/women-scheme-application" element={<WomenSchemeApplication />} />
          <Route path="/women-schemes" element={<WomenSchemes />} />
          <Route path="/women-health" element={<WomenHealthCare />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
