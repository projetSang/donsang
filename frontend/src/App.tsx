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
import AdminDashboard from "./pages/AdminDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";
import UrgentAlerts from "./pages/UrgentAlerts.tsx";
import SharedDossier from "./pages/SharedDossier.tsx";
import Register from "./pages/Register.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.tsx";
import VoiceAssistant from "./components/ui/VoiceAssistant.tsx";
import { slugify } from "@/lib/utils";
const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const HospitalRedirect = () => {
  const { user, isAuthenticated, userType } = useAuth();
  
  if (isAuthenticated && userType === "hospital" && user?.name) {
    return <Navigate to={`/Donsang/${slugify(user.name)}`} replace />;
  }
  
  return <Navigate to="/login" replace />;
};

const PatientRedirect = () => {
  const { user, isAuthenticated, userType } = useAuth();
  
  if (isAuthenticated && userType === "patient") {
    const patientName = user?.full_name || user?.name || "patient";
    return <Navigate to={`/Donsang/Mon-dossier/${slugify(patientName)}`} replace />;
  }
  
  return <Navigate to="/login" replace />;
};

const routesConfig = [
  { path: "/", element: <Index /> },
  { path: "/UrgentAlerts", element: <UrgentAlerts /> },
  { path: "/contact", element: <Contact /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/patient", element: <PatientRedirect />, protected: true },
  { path: "/Donsang/Mon-dossier/:userName", element: <PatientDashboard />, protected: true },
  { path: "/hospital", element: <HospitalRedirect />, protected: true },
  { path: "/Donsang/:hospitalName", element: <HospitalDashboard />, protected: true },
  { path: "/admin", element: <AdminDashboard />, protected: true },
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
          <VoiceAssistant />
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
