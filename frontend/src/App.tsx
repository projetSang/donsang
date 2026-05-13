import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Contact from "./pages/Contact.tsx";
import PatientDashboard from "./pages/PatientDashboard.tsx";
import HospitalDashboard from "./pages/HospitalDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";
import UrgentAlerts from "./pages/UrgentAlerts.tsx";
import SharedDossier from "./pages/SharedDossier.tsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.tsx";
const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const routesConfig = [
  { path: "/", element: <Index /> },
  { path: "/UrgentAlerts", element: <UrgentAlerts /> },
  { path: "/contact", element: <Contact /> },
  { path: "/login", element: <Login /> },
  { path: "/patient", element: <PatientDashboard />, protected: true },
  { path: "/hospital", element: <HospitalDashboard />, protected: true },
  { path: "/dossier/partage/:token", element: <SharedDossier /> },
  { path: "*", element: <NotFound /> },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {routesConfig.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.protected ? (
                    <ProtectedRoute>{route.element}</ProtectedRoute>
                  ) : (
                    route.element
                  )
                }
              />
            ))}
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
