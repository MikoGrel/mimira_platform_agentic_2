"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Alert, Form } from "@heroui/react";
import { createClient } from "$/lib/supabase/client";
import { useMemo, useState } from "react";

interface ForgotPasswordFormProps {
  error: string | null;
  onInputChange: () => void;
  onBackToLogin: () => void;
  onRequestReset: (email: string) => void;
}

export default function ForgotPasswordForm({
  error,
  onInputChange,
  onBackToLogin,
  onRequestReset,
}: ForgotPasswordFormProps) {
  const client = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!email) {
      setLocalError("Email is required");
      return;
    }
    setSubmitting(true);
    try {
      const redirectTo = `${window.location.origin}/login`;
      const { error: supaError } = await client.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );
      if (supaError) {
        setLocalError(supaError.message);
        return;
      }
      onRequestReset(email);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-medium">Reset Password:</h1>
        <h2 className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password
        </h2>
      </div>

      <Form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
        {(error || localError) && (
          <Alert color="danger" title={error ?? localError ?? undefined} />
        )}
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            if (localError) setLocalError(null);
            onInputChange();
            setEmail(e.target.value);
          }}
        />
        <Button
          className="mt-6"
          type="submit"
          color="primary"
          isLoading={submitting}
          fullWidth
        >
          Send Reset Link
        </Button>
        <Button
          type="button"
          variant="bordered"
          onPress={onBackToLogin}
          fullWidth
        >
          Back to Login
        </Button>
      </Form>
    </div>
  );
}
