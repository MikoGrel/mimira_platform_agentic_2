"use client";

import {
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@heroui/react";
import useCurrentUser from "../api/use-current-user";
import { Controller, useForm } from "react-hook-form";
import { createClient } from "$/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { PasswordUpdateForm } from "./password-update-form";
import { toast } from "sonner";

type AccessFormValues = { email: string };

export function AccessForm() {
  const client = useMemo(() => createClient(), []);
  const { user } = useCurrentUser();
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const { control, setValue } = useForm<AccessFormValues>({
    defaultValues: {
      email: user?.email ?? "",
    },
  });

  useEffect(() => {
    if (user?.email) {
      setValue("email", user.email);
    }
  }, [user?.email, setValue]);

  // If user arrives with recovery tokens in the URL hash, set session and show password form
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const search = window.location.search;

    // New flow: token_hash in query string (custom email template)
    const searchParams = new URLSearchParams(search);
    const token_hash = searchParams.get("token_hash");
    const qType = searchParams.get("type");
    if (token_hash && (!qType || qType === "recovery")) {
      setIsRecoveryMode(true);
      client.auth.verifyOtp({ type: "recovery", token_hash }).finally(() => {
        try {
          // Remove token_hash from URL
          const url = new URL(window.location.href);
          url.searchParams.delete("token_hash");
          url.searchParams.delete("type");
          history.replaceState(null, "", url.pathname + url.search);
        } catch {}
      });
      return;
    }

    // Legacy/default flow: tokens in hash fragment
    if (!hash) return;
    const params = new URLSearchParams(
      hash.startsWith("#") ? hash.slice(1) : hash
    );
    const type = params.get("type");
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (type === "recovery") {
      setIsRecoveryMode(true);
      if (access_token && refresh_token) {
        client.auth.setSession({ access_token, refresh_token }).finally(() => {
          // Clean the URL to avoid reprocessing
          try {
            history.replaceState(null, "", location.pathname + location.search);
          } catch {}
        });
      }
    }
  }, [client]);

  return (
    <Card shadow="none" className="border">
      <CardHeader className="font-medium">Access settings</CardHeader>
      <Divider />
      <CardBody>
        {isRecoveryMode ? (
          <PasswordUpdateForm onSuccess={() => setIsRecoveryMode(false)} />
        ) : (
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                label="Reset password"
                variant="bordered"
                fullWidth
                value={field.value ?? ""}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                endContent={
                  <Button
                    onPress={() => {
                      client.auth.resetPasswordForEmail(field.value, {
                        redirectTo: window.location.href,
                      });
                      toast.success(
                        <>Reset password email sent to {field.value}</>
                      );
                    }}
                    size="sm"
                    radius="full"
                    className="px-6"
                    color="primary"
                  >
                    <span>Send link</span>
                  </Button>
                }
              />
            )}
          />
        )}
      </CardBody>
    </Card>
  );
}
