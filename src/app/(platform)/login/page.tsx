"use client";

import Image from "next/image";
import HappyOfficeWorkers from "$/assets/happy-office-workers.jpg";
import Logo from "$/features/branding/components/Logo";
import Link from "next/link";
import { useQueryState, parseAsString } from "nuqs";
import { useEffect } from "react";
import {
  LoginForm,
  ForgotPasswordForm,
  EmailSentMessage,
} from "$/features/auth/components";
import ProgressiveBlurMask from "$/components/ui/progressive-blur-mask";
import useQueryToast from "$/hooks/use-query-toast";

type AuthStep = "login" | "forgot-password" | "email-sent";
const authSteps: AuthStep[] = ["login", "forgot-password", "email-sent"];

export default function LoginPage() {
  useQueryToast("loggedOut", <span>Logged out successfully</span>, "success");

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

  // Handle reset status from URL parameters
  useEffect(() => {
    if (resetStatus === "sent" && resetEmail) {
      setStep("email-sent");
    }
  }, [resetStatus, resetEmail, setStep]);

  // Clear error when component mounts or when user starts typing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // Auto-clear error after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  const handleInputChange = () => {
    if (error) {
      setError(null);
    }
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

  return (
    <main className="w-screen h-screen grid grid-cols-2 grid-rows-1 mx-auto">
      <section className="p-6">
        <div className="relative w-full h-full rounded-3xl overflow-hidden">
          <Image
            src={HappyOfficeWorkers}
            alt="Happy Office Workers"
            fill
            className="object-cover grayscale"
          />
          <ProgressiveBlurMask />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-primary/60" />
        </div>
      </section>
      <section className="grid grid-cols-1 grid-rows-[auto_1fr_auto] p-6">
        <div className="flex flex-center py-8">
          <Logo className="h-9" />
        </div>
        <div className="flex flex-col gap-12 items-center justify-center w-sm mx-auto">
          {step === "login" && (
            <LoginForm
              error={error}
              onInputChange={handleInputChange}
              onForgotPasswordClick={handleForgotPasswordClick}
            />
          )}
          {step === "forgot-password" && (
            <ForgotPasswordForm
              error={error}
              onInputChange={handleInputChange}
              onBackToLogin={handleBackToLogin}
            />
          )}
          {step === "email-sent" && (
            <EmailSentMessage
              resetEmail={resetEmail}
              onBackToLogin={handleBackToLogin}
            />
          )}
        </div>
        <div className="flex flex-center gap-2 py-8">
          You don&apos;t have an account?
          <Link
            href="https://cal.com/mikolaj-grelewicz-kke2et/mimira"
            target="_blank"
            className="text-primary inline-block"
          >
            Contact us
          </Link>
        </div>
      </section>
    </main>
  );
}
