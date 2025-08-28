"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Form,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { UpdateProfileData, useUpdateProfile } from "../api/use-update-profile";
import useCurrentUser from "../api/use-current-user";
import { useEffect } from "react";

export function ProfileForm() {
  const { user, isLoading } = useCurrentUser();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { handleSubmit, control, reset, getValues } =
    useForm<UpdateProfileData>({
      defaultValues: {},
    });

  useEffect(() => {
    if (user && !getValues("first_name")) {
      reset({
        first_name: user.profile?.first_name,
        last_name: user.profile?.last_name,
        preferred_locale: user.profile?.preferred_locale,
      });
    }
  }, [user, reset, getValues]);

  const onSubmit = handleSubmit((data) => {
    updateProfile({
      ...data,
      id: user!.profile!.id,
    });
  });

  return (
    <Card isDisabled={isLoading || isPending} shadow="none" className="border">
      <CardHeader className="font-medium">Edit profile</CardHeader>
      <Divider />
      <CardBody>
        <Form onSubmit={onSubmit}>
          <fieldset className="flex flex-col gap-4 w-full">
            <Controller
              control={control}
              name="first_name"
              render={({ field, fieldState }) => (
                <Input
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  errorMessage={fieldState.error?.message}
                  isInvalid={!!fieldState.error}
                  placeholder="Enter first name"
                  label="First name"
                  variant="bordered"
                />
              )}
            />
            <Controller
              control={control}
              name="last_name"
              render={({ field, fieldState }) => (
                <Input
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  errorMessage={fieldState.error?.message}
                  isInvalid={!!fieldState.error}
                  placeholder="Enter last name"
                  label="Last name"
                  variant="bordered"
                />
              )}
            />
            <Controller
              control={control}
              name="preferred_locale"
              render={({ field, fieldState }) => (
                <Select
                  selectedKeys={field.value ? [field.value] : undefined}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    field.onChange(selectedKey);
                  }}
                  placeholder="Select preferred locale"
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  variant="bordered"
                  isClearable
                  label="Preferred locale"
                >
                  <SelectItem key="en" data-lingo-skip>
                    English (US)
                  </SelectItem>
                  <SelectItem key="pl" data-lingo-skip>
                    Polish (PL)
                  </SelectItem>
                </Select>
              )}
            />
            <Button type="submit" fullWidth color="primary">
              Save
            </Button>
          </fieldset>
        </Form>
      </CardBody>
    </Card>
  );
}
