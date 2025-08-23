import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import AuthGuard from "./components/AuthGuard";
import Layout from "./components/Layout";
import OvertimeInput from "./pages/OvertimeInput";
import EmployeeRegistration from "./pages/EmployeeRegistration";
import Reports from "./pages/Reports";
import Export from "./pages/Export";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <AuthGuard allowGuests>
                <Layout>
                  <OvertimeInput />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/employee-registration" element={
              <AuthGuard allowGuests>
                <Layout>
                  <EmployeeRegistration />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/reports" element={
              <AuthGuard requireAdmin>
                <Layout>
                  <Reports />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/export" element={
              <AuthGuard requireAdmin>
                <Layout>
                  <Export />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/settings" element={
              <AuthGuard requireAdmin>
                <Layout>
                  <Settings />
                </Layout>
              </AuthGuard>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
