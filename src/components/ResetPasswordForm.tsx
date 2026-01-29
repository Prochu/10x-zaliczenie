import React, { useState, useId } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { supabaseClient } from "../db/supabase.client";

export const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordId = useId();
  const confirmPasswordId = useId();

  const validatePassword = (value: string): string | null => {
    if (value.length < 8) {
      return "Password must be at least 8 characters";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabaseClient.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message || "Failed to update password");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-background/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Password updated</h1>
          <p className="text-foreground/70">Your password has been successfully changed</p>
        </div>
        <div className="space-y-6">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
            <p className="text-sm font-medium">You can now sign in with your new password.</p>
          </div>

          <Button
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
            onClick={() => (window.location.href = "/auth/login")}
          >
            Continue to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-background/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Set new password</h1>
        <p className="text-muted-foreground">Enter your new password below</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor={passwordId}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
          >
            New password
          </Label>
          <Input
            id={passwordId}
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="new-password"
            minLength={8}
            className="bg-background/50 border-white/10 focus:ring-primary/50 h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={confirmPasswordId}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
          >
            Confirm new password
          </Label>
          <Input
            id={confirmPasswordId}
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="new-password"
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
              <span>Updating password...</span>
            </div>
          ) : (
            "Update password"
          )}
        </Button>
      </form>
    </div>
  );
};
