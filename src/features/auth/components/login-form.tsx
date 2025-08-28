"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Alert, Checkbox } from "@heroui/react";
import { useFormStatus } from "react-dom";
import { login } from "$/features/auth/actions";
import useCurrentUser from "$/features/auth/api/use-current-user";
import Link from "$/components/ui/link";
import { MoveRight } from "lucide-react";

interface LoginFormProps {
  error: string | null;
  onInputChange: () => void;
  onForgotPasswordClick: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-6" type="submit" color="primary" isLoading={pending}>
      Log in
    </Button>
  );
}

export default function LoginForm({
  error,
  onInputChange,
  onForgotPasswordClick,
}: LoginFormProps) {
  const { user } = useCurrentUser();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-medium">Log in:</h1>
        <h2 className="text-muted-foreground">
          Enter your email address and password to enter your dashboard
        </h2>
      </div>
      <form action={login} className="w-full flex flex-col gap-6">
        {error && <Alert color="danger" title={error} />}
        <Input
          label="Email"
          name="email"
          type="email"
          required
          onChange={onInputChange}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          required
          onChange={onInputChange}
        />
        <div className="w-full flex justify-between items-center">
          <Checkbox>Remember me</Checkbox>
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="hover:text-primary text-sm"
          >
            Forgot password?
          </button>
        </div>
        <SubmitButton />
        {user ? (
          <Link href="/dashboard" className="text-sm text-primary text-center">
            You are already logged as {user.profile?.first_name}{" "}
            <MoveRight className="stroke-1 inline" />
          </Link>
        ) : null}
      </form>
    </div>
  );
}
