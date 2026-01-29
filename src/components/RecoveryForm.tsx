import React, { useState, useId } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export const RecoveryForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emailId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send recovery email");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Recovery error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-background/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Check your email</h1>
          <p className="text-foreground/70">We've sent you a password reset link</p>
        </div>
        <div className="space-y-6">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
            <p className="text-sm">
              If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
          </div>

          <p className="text-sm text-foreground/80 text-center">
            Didn't receive the email? Check your spam folder or try again.
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              className="w-full h-11 border-white/10 hover:bg-white/5 rounded-xl transition-all" 
              onClick={() => setSuccess(false)}
            >
              Send another link
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-11 hover:bg-white/5 rounded-xl transition-all font-bold" 
              onClick={() => (window.location.href = "/auth/login")}
            >
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-background/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Reset your password</h1>
        <p className="text-foreground/70">Enter your email address and we'll send you a reset link</p>
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

        <Button 
          type="submit" 
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Sending link...</span>
            </div>
          ) : (
            "Send reset link"
          )}
        </Button>

        <div className="text-center text-sm text-foreground/80 pt-2">
          Remember your password?{" "}
          <a href="/auth/login" className="text-primary hover:underline font-bold">
            Sign in
          </a>
        </div>
      </form>
    </div>
  );
};
