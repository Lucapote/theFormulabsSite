import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProposalPage from "./pages/ProposalPage.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PublicCalendarPage from "./pages/PublicCalendarPage.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UploadProvider } from "./context/UploadContext.jsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UploadProvider>
        <TooltipProvider>
          <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/propuesta/:slug" element={<ProposalPage />} />
            <Route path="/calendario/:slug" element={<PublicCalendarPage />} />
            <Route path="/:clientSlug/:calendarSlug" element={<PublicCalendarPage />} />
            <Route path="/:slug" element={<ProposalPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UploadProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;
