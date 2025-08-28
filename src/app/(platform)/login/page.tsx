"use client";

import Logo from "$/features/branding/components/Logo";
import Link from "$/components/ui/link";
import { useLoginController } from "$/features/auth/hooks/use-login-controller";
import { LoginForm, ForgotPasswordForm, EmailSentMessage } from "$/features/auth/components";
import { PasswordUpdateForm } from "$/features/auth/components/password-update-form";
import { Button } from "@heroui/button";
import useQueryToast from "$/hooks/use-query-toast";
import Partners from "$/features/branding/components/Partners";
import { GateIllustration } from "$/features/branding/components/gate";
import { LocaleSwitcher } from "$/features/i18n/components/LocaleSwitcher";

export default function LoginPage() {
  useQueryToast("loggedOut", <span>Logged out successfully</span>, "success");
  const {
    step,
    error,
    resetEmail,
    handleInputChange,
    handleForgotPasswordClick,
    handleBackToLogin,
    handlePasswordResetRequested,
  } = useLoginController();

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
            Welcome back!
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
              onRequestReset={handlePasswordResetRequested}
            />
          )}
          {step === "email-sent" && (
            <EmailSentMessage
              resetEmail={resetEmail}
              onBackToLogin={handleBackToLogin}
            />
          )}
          {step === "password-update" && (
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-3">
                <h1 className="font-heading text-3xl font-medium">Set new password:</h1>
                <h2 className="text-muted-foreground">
                  Enter your new password to complete the reset.
                </h2>
              </div>
              <PasswordUpdateForm onSuccess={handleBackToLogin} />
              <Button type="button" variant="bordered" onClick={handleBackToLogin}>
                Back to Login
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-center gap-2">
          You don&apos;t have an account?
          <Link
            href="https://cal.com/mikolaj-grelewicz-kke2et/mimira"
            className="text-primary inline-block"
          >
            Contact us
          </Link>
        </div>
      </section>
    </main>
  );
}
