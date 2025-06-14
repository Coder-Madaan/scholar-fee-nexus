
import { useEffect } from "react";
import { Provider } from 'react-redux';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "@/components/Auth";
import OrganizationSetup from "@/components/OrganizationSetup";
import { store } from "@/store/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeAuth, setSession, clearAuth, createOrganization } from "@/store/authSlice";
import { supabase } from "@/lib/supabase";

const queryClient = new QueryClient();

const AppContent = () => {
  const dispatch = useAppDispatch();
  const { user, loading, needsOrgSetup, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state
    dispatch(initializeAuth());

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session) {
        dispatch(setSession(session));
        // Re-initialize to check organization status
        dispatch(initializeAuth());
      } else {
        dispatch(clearAuth());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  const handleOrgSetupComplete = async (name: string, userEmail: string) => {
    try {
      await dispatch(createOrganization({ name, userEmail })).unwrap();
    } catch (error) {
      console.error('Organization setup failed:', error);
    }
  };

  const handleAuthSuccess = () => {
    dispatch(initializeAuth());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (needsOrgSetup) {
    return (
      <OrganizationSetup 
        userEmail={user.email || ''} 
        onSetupComplete={handleOrgSetupComplete}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
