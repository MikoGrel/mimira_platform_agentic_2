"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Alert } from "@heroui/react";
import { useFormStatus } from "react-dom";
import { forgotPassword } from "$/features/auth/actions";

interface ForgotPasswordFormProps {
  error: string | null;
  onInputChange: () => void;
  onBackToLogin: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-6" type="submit" color="primary" isLoading={pending}>
      Send Reset Link
    </Button>
  );
}

export default function ForgotPasswordForm({
  error,
  onInputChange,
  onBackToLogin,
}: ForgotPasswordFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-medium">Reset Password:</h1>
        <h2 className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password
        </h2>
      </div>

      <form action={forgotPassword} className="w-full flex flex-col gap-3">
        {error && <Alert color="danger" title={error} />}
        <Input
          label="Email"
          name="email"
          type="email"
          required
          onChange={onInputChange}
          placeholder="Enter your email address"
        />
        <SubmitButton />
        <Button type="button" variant="bordered" onClick={onBackToLogin}>
          Back to Login
        </Button>
      </form>
    </div>
  );
}
