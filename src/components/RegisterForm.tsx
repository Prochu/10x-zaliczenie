import React, { useState, useId } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface RegisterFormProps {
  redirectTo?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ redirectTo = "/dashboard" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailId = useId();
  const nicknameId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const validateNickname = (value: string): string | null => {
    if (value.length < 3 || value.length > 15) {
      return "Nickname must be 3-15 characters";
    }
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return "Nickname must be alphanumeric only";
    }
    return null;
  };

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
    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      setError(nicknameError);
      return;
    }

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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, nickname }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Redirect to the specified page
      window.location.href = redirectTo;
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-background/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create an account</h1>
        <p className="text-foreground/70">Enter your details to get started</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <Label htmlFor={nicknameId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
            Nickname
          </Label>
          <Input
            id={nicknameId}
            type="text"
            placeholder="3-15 alphanumeric characters"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="username"
            minLength={3}
            maxLength={15}
            pattern="[a-zA-Z0-9]+"
            className="bg-background/50 border-white/10 focus:ring-primary/50 h-11 rounded-xl"
          />
          <p className="text-[10px] text-muted-foreground ml-1">This will be displayed on the leaderboard</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={passwordId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
            Password
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
          <Label htmlFor={confirmPasswordId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
            Confirm password
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
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 mt-2" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Creating account...</span>
            </div>
          ) : (
            "Create account"
          )}
        </Button>

        <div className="text-center text-sm text-foreground/80 pt-2">
          Already have an account?{" "}
          <a href="/auth/login" className="text-primary hover:underline font-bold">
            Sign in
          </a>
        </div>
      </form>
    </div>
  );
};
