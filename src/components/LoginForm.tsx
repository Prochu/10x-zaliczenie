import React, { useState, useId } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface LoginFormProps {
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ redirectTo = "/dashboard" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailId = useId();
  const passwordId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      // Redirect to the specified page
      window.location.href = redirectTo;
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-background/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
        <p className="text-foreground/70">Sign in to your account to continue</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={emailId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
            Email
          </Label>
          <Input
            id={emailId}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="email"
            className="bg-background/50 border-white/10 focus:ring-primary/50 h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <Label htmlFor={passwordId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <a href="/auth/recovery" className="text-xs text-primary hover:underline font-medium">
              Forgot password?
            </a>
          </div>
          <Input
            id={passwordId}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="current-password"
            className="bg-background/50 border-white/10 focus:ring-primary/50 h-11 rounded-xl"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign in"
          )}
        </Button>

        <div className="text-center text-sm text-foreground/80 pt-2">
          Don't have an account?{" "}
          <a href="/auth/register" className="text-primary hover:underline font-bold">
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
};
