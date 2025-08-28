"use client";

import { Button, Form, Input } from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { useMemo } from "react";
import { createClient } from "$/lib/supabase/client";
import { toast } from "sonner";

type PasswordUpdateFormValues = {
  password: string;
  confirm_password: string;
};

export function PasswordUpdateForm({ onSuccess }: { onSuccess?: () => void }) {
  const client = useMemo(() => createClient(), []);

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<PasswordUpdateFormValues>({
    defaultValues: { password: "", confirm_password: "" },
  });

  const onSubmit = handleSubmit(async ({ password, confirm_password }) => {
    if (password !== confirm_password) {
      setError("confirm_password", {
        type: "validate",
        message: "Passwords do not match",
      });
      return;
    }

    const { error } = await client.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(<>Password updated. You can now sign in</>);
    onSuccess?.();
  });

  return (
    <Form onSubmit={onSubmit}>
      <fieldset className="flex flex-col gap-4 w-full">
        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
            minLength: { value: 8, message: "Minimum 8 characters" },
          }}
          render={({ field, fieldState }) => (
            <Input
              type="password"
              label="New password"
              variant="bordered"
              fullWidth
              value={field.value ?? ""}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirm_password"
          rules={{ required: "Please confirm password" }}
          render={({ field, fieldState }) => (
            <Input
              type="password"
              label="Confirm password"
              variant="bordered"
              fullWidth
              value={field.value ?? ""}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        <Button
          type="submit"
          color="primary"
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
        >
          Update password
        </Button>
      </fieldset>
    </Form>
  );
}
