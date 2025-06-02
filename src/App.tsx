
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

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session?.user) {
        // Check if user has an organization
        try {
          await organizationOperations.getUserOrganization();
          setNeedsOrgSetup(false);
        } catch (error) {
          setNeedsOrgSetup(true);
        }
      }
      
      setLoading(false);
    });

    // Check if already logged in on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        try {
          await organizationOperations.getUserOrganization();
          setNeedsOrgSetup(false);
        } catch (error) {
          setNeedsOrgSetup(true);
        }
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleOrgSetupComplete = async () => {
    setNeedsOrgSetup(false);
    // Refresh the session to ensure everything is updated
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthSuccess={() => {
      supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    }} />;
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

