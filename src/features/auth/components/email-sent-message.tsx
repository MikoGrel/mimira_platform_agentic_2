"use client";

import { Button } from "@heroui/button";
import { MailCheck } from "lucide-react";

interface EmailSentMessageProps {
  resetEmail: string | null;
  onBackToLogin: () => void;
}

export default function EmailSentMessage({
  resetEmail,
  onBackToLogin,
}: EmailSentMessageProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex flex-center">
          <MailCheck className="w-8 h-8 text-success" />
        </div>
        <h1 className="font-heading text-4xl font-medium">Check Your Email</h1>
        <h2 className="text-muted-foreground">
          We&apos;ve sent a password reset link to{" "}
          <span className="font-medium text-foreground">{resetEmail}</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or try again.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <Button
          type="button"
          variant="bordered"
          onClick={onBackToLogin}
          className="mt-4"
        >
          Back to Login
        </Button>
      </div>
    </div>
  );
}
