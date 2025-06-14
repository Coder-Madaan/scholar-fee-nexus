
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "@/components/Auth";
import OrganizationSetup from "@/components/OrganizationSetup";
import { supabase, organizationOperations } from "@/lib/supabase";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [needsOrgSetup, setNeedsOrgSetup] = useState(false);

  const checkUserOrganization = async (user: any) => {
    if (!user) return;
    
    try {
      console.log('Checking user organization for:', user.email);
      const orgData = await organizationOperations.getUserOrganization();
      console.log('Organization found:', orgData);
      setNeedsOrgSetup(false);
    } catch (error) {
      console.log('No organization found, needs setup:', error);
      setNeedsOrgSetup(true);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('Initial session:', session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          await checkUserOrganization(session.user);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      
      if (session?.user && event === 'SIGNED_IN') {
        await checkUserOrganization(session.user);
      } else if (!session) {
        setNeedsOrgSetup(false);
      }
      
      setLoading(false);
    });

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleOrgSetupComplete = async () => {
    console.log('Organization setup completed');
    setNeedsOrgSetup(false);
    
    // Refresh the session to ensure everything is updated
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const handleAuthSuccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await checkUserOrganization(session.user);
      }
    } catch (error) {
      console.error('Error in handleAuthSuccess:', error);
    }
  };

  console.log('App state:', { loading, session: !!session, needsOrgSetup });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (needsOrgSetup) {
    return (
      <OrganizationSetup 
        userEmail={session.user.email || ''} 
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

export default App;
