import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountManagementPage from "./pages/AccountManagementPage";
import ProfilePage from "./pages/ProfilePage";
import ReportsPage from "./pages/ReportsPage";
import DivisionsPage from "./pages/DivisionsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import NotesPage from "./pages/NotesPage"; // Import NotesPage
import { AuthProvider, ProtectedRoute } from "./contexts/AuthContext";
import CreateAdminUser from "./components/CreateAdminUser";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          {/* Temporary component to create admin user - REMOVE AFTER USE */}
          <CreateAdminUser /> 
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/divisions" element={<DivisionsPage />} />
                      <Route path="/announcements" element={<AnnouncementsPage />} />
                      <Route path="/notes" element={<NotesPage />} /> {/* Add NotesPage route */}
                      <Route
                        path="/account-management"
                        element={<ProtectedRoute allowedRoles={["Lieutenant", "Captain", "High Command"]}><AccountManagementPage /></ProtectedRoute>}
                      />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;