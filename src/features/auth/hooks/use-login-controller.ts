"use client";

import { useEffect, useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { createClient } from "$/lib/supabase/client";

type AuthStep = "login" | "forgot-password" | "email-sent" | "password-update";
const authSteps: AuthStep[] = [
  "login",
  "forgot-password",
  "email-sent",
  "password-update",
];

export function useLoginController() {
  const client = useMemo(() => createClient(), []);
  const [error, setError] = useQueryState("error", parseAsString);
  const [resetStatus, setResetStatus] = useQueryState("reset", parseAsString);
  const [resetEmail, setResetEmail] = useQueryState("email", parseAsString);
  const [step, setStep] = useQueryState<AuthStep>("step", {
    defaultValue: "login",
    parse: (value) => {
      if (authSteps.includes(value as AuthStep)) {
        return value as AuthStep;
      }
      return authSteps[0];
    },
    serialize: String,
  });

  // Move to email-sent step after successful reset request
  useEffect(() => {
    if (resetStatus === "sent" && resetEmail) {
      setStep("email-sent");
    }
  }, [resetStatus, resetEmail, setStep]);

  // Auto clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  // Detect recovery tokens; verify and show password update form inline
  useEffect(() => {
    if (typeof window === "undefined") return;

    const search = window.location.search;

    // New flow: token_hash in query string (custom email template)
    const searchParams = new URLSearchParams(search);
    const token_hash = searchParams.get("token_hash");
    const qType = searchParams.get("type");
    if (token_hash && (!qType || qType === "recovery")) {
      client.auth.verifyOtp({ type: "recovery", token_hash }).finally(() => {
        try {
          // Remove token params, keep other search params intact
          const url = new URL(window.location.href);
          url.searchParams.delete("token_hash");
          url.searchParams.delete("type");
          history.replaceState(null, "", url.pathname + url.search);
        } catch {}
        // After URL cleanup, move to password update step
        setStep("password-update");
      });
      return;
    }
  }, [client, setStep]);

  const handleInputChange = () => {
    if (error) setError(null);
  };

  const handleForgotPasswordClick = () => {
    setStep("forgot-password");
    setError(null);
  };

  const handleBackToLogin = () => {
    setStep("login");
    setError(null);
    setResetStatus(null);
    setResetEmail(null);
  };

  const handlePasswordResetRequested = (email: string) => {
    setResetEmail(email);
    setResetStatus("sent");
    setStep("email-sent");
  };

  return {
    step,
    error,
    resetEmail,
    handleInputChange,
    handleForgotPasswordClick,
    handleBackToLogin,
    handlePasswordResetRequested,
  } as const;
}
