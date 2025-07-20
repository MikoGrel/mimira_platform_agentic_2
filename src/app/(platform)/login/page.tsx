"use client";

import { Button } from "@heroui/button";
import { login } from "./actions";
import { Input } from "@heroui/input";
import Image from "next/image";
import HappyOfficeWorkers from "$/assets/happy-office-workers.jpg";
import Logo from "$/features/branding/components/Logo";
import Link from "next/link";
import { useQueryState, parseAsString } from "nuqs";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";
import { Alert, Checkbox } from "@heroui/react";

export default function LoginPage() {
  const { pending } = useFormStatus();
  const [error, setError] = useQueryState("error", parseAsString);

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
          <div
            className="absolute inset-0 backdrop-blur-sm bg-gradient-to-b from-transparent to-black/10"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 60%, black 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 60%, black 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-primary/60" />
        </div>
      </section>
      <section className="grid grid-cols-1 grid-rows-[auto_1fr_auto] p-6">
        <div className="flex flex-center py-8">
          <Logo className="h-9" />
        </div>
        <div className="flex flex-col gap-12 items-center justify-center w-sm mx-auto">
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
              onChange={handleInputChange}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              required
              onChange={handleInputChange}
            />
            <div className="w-full flex justify-between items-center">
              <Checkbox>Remember me</Checkbox>
              <Link href="/forgot-password" className="hover:text-primary">
                Forgot password?
              </Link>
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
