"use client";
// components/LoginForm.tsx
//
// Client component demonstrating useNexusAuth + useNexusAnalytics together:
// a login form that tracks a custom event on failed attempts and relies on
// the SDK's built-in identity stitching on success (see auth/context.tsx).

import { useState } from "react";
import { useNexusAuth, useNexusAnalytics } from "@gnapex/sdk/react";

export function LoginForm() {
  const { login, isLoading, error } = useNexusAuth();
  const { track } = useNexusAnalytics();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // No manual "login" tracking call needed here — the SDK's AuthProvider
      // already calls analytics.identify() on a successful login.
    } catch {
      track("login_failed", { reason: "invalid_credentials" });
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={isLoading}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p role="alert">{error.message}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
