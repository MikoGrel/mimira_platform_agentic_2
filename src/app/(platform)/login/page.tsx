"use client";

import Logo from "$/features/branding/components/Logo";
import Link from "next/link";
import { useQueryState, parseAsString } from "nuqs";
import { useEffect } from "react";
import {
  LoginForm,
  ForgotPasswordForm,
  EmailSentMessage,
} from "$/features/auth/components";
import useQueryToast from "$/hooks/use-query-toast";
import Partners from "$/features/branding/components/Partners";
import { GateIllustration } from "$/features/branding/components/gate";
import { LocaleSwitcher } from "lingo.dev/react-client";

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

  useEffect(() => {
    if (resetStatus === "sent" && resetEmail) {
      setStep("email-sent");
    }
  }, [resetStatus, resetEmail, setStep]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

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
      <section className="p-24 grid grid-cols-1 grid-rows-[auto_1fr_auto] bg-accent">
        <div className="flex items-center gap-4">
          <Logo className="h-10" />
          <LocaleSwitcher locales={["en", "pl"]} />
        </div>
        <div className="flex flex-col justify-center gap-6">
          <GateIllustration className="h-50 w-fit text-muted-foreground" />
          <h1 className="font-heading text-6xl font-bold text-font-base">
            Welcome back
          </h1>
          <h2 className="text-muted-foreground text-xl w-3/4">
            Log in to browse, analyze and manage your tenders.
          </h2>
        </div>
        <div className="flex flex-col gap-4 uppercase text-muted-foreground font-medium tracking-wide">
          <p>Trusted by:</p>
          <Partners />
        </div>
      </section>
      <section className="grid grid-cols-1 grid-rows-[1fr_auto] p-24">
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
        <div className="flex flex-center gap-2">
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
