import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SocialMediaProvider } from "@/contexts/SocialMediaContext";
import Index from "./pages/Index";
import Instagram from "./pages/Instagram";
import YouTube from "./pages/YouTube";
import Blog from "./pages/Blog";
import Scheduler from "./pages/Scheduler";
import Summarizer from "./pages/Summarizer";
import LinkedIn from "./pages/LinkedIn";
import Pinterest from "./pages/Pinterest";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component (redirects to home if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={
      <PublicRoute>
        <Login />
      </PublicRoute>
    } />
    
    <Route path="/" element={
      <ProtectedRoute>
        <Layout>
          <Index />
        </Layout>
      </ProtectedRoute>
    } />
    
    <Route path="/instagram" element={
      <ProtectedRoute>
        <Layout>
          <Instagram />
        </Layout>
      </ProtectedRoute>
    } />
    
    <Route path="/youtube" element={
      <ProtectedRoute>
        <Layout>
          <YouTube />
        </Layout>
      </ProtectedRoute>
    } />
    
    <Route path="/blog" element={
      <ProtectedRoute>
        <Layout>
          <Blog />
        </Layout>
      </ProtectedRoute>
    } />
    
    <Route path="/scheduler" element={
      <ProtectedRoute>
        <Layout>
          <Scheduler />
        </Layout>
      </ProtectedRoute>
    } />
    
    <Route path="/summarizer" element={
      <ProtectedRoute>
        <Layout>
          <Summarizer />
        </Layout>
      </ProtectedRoute>
    } />
    
    <Route path="/linkedin" element={
      <ProtectedRoute>
        <Layout>
          <LinkedIn />
        </Layout>
      </ProtectedRoute>
    } />
    
    <Route path="/pinterest" element={
      <ProtectedRoute>
        <Layout>
          <Pinterest />
        </Layout>
      </ProtectedRoute>
    } />
    
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SocialMediaProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/">
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </SocialMediaProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
