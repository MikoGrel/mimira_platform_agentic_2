"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Alert, Checkbox } from "@heroui/react";
import { useFormStatus } from "react-dom";
import { login } from "$/features/auth/actions";

interface LoginFormProps {
  error: string | null;
  onInputChange: () => void;
  onForgotPasswordClick: () => void;
}

export default function LoginForm({
  error,
  onInputChange,
  onForgotPasswordClick,
}: LoginFormProps) {
  const { pending } = useFormStatus();

  return (
    <>
      <div className="flex flex-col text-center gap-3">
        <h1 className="font-heading text-4xl font-medium">Welcome Back</h1>
        <h2 className="text-muted-foreground">
          Fill in your email and password to continue
        </h2>
      </div>

      <form className="w-full flex flex-col gap-6">
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
        <Button
          className="mt-6"
          type="submit"
          formAction={login}
          color="primary"
          isLoading={pending}
        >
          Log in
        </Button>
      </form>
    </>
  );
}
