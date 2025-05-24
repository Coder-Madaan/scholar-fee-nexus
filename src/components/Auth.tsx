
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const PROJECT_NAME = "School Fees Management";

const Auth = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            setError("Email not confirmed. Please check your inbox and confirm your email before logging in.");
          } else {
            setError(error.message);
          }
        } else {
          onAuthSuccess();
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
        } else {
          setMode("login");
          setError("Signup successful! Please check your email to confirm and then login.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      {/* Project header */}
      <header className="flex items-center gap-3 py-8">
        <img
          src="/favicon.ico"
          alt="Logo"
          className="h-10 w-10 rounded shadow"
        />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white select-none">
          {PROJECT_NAME}
        </h1>
      </header>
      <Card className="w-full max-w-xs border-gray-800 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">{mode === "login" ? "Login" : "Sign Up"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                className="bg-gray-700 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                className="bg-gray-700 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}
            <Button type="submit" disabled={loading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
              {loading ? (mode === "login" ? "Logging in..." : "Signing up...") : (mode === "login" ? "Login" : "Sign Up")}
            </Button>
          </form>
          <div className="text-gray-400 text-sm text-center mt-4">
            {mode === "login" ? (
              <>
                Need an account?{" "}
                <button onClick={() => setMode("signup")} className="underline hover:text-blue-400">Sign Up</button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="underline hover:text-blue-400">Login</button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

