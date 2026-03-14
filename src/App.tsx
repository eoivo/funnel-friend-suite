import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import DashboardPage from "@/pages/Dashboard";
import LeadsPage from "@/pages/Leads";
import LeadDetailPage from "@/pages/LeadDetail";
import CampaignsPage from "@/pages/Campaigns";
import CampaignFormPage from "@/pages/CampaignForm";
import SettingsPage from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
              <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/leads/:id" element={<LeadDetailPage />} />
                <Route path="/campaigns" element={<CampaignsPage />} />
                <Route path="/campaigns/new" element={<CampaignFormPage />} />
                <Route path="/campaigns/:id" element={<CampaignFormPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
