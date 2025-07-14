import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { login, signup } from "./actions";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/react";

export default function LoginPage() {
  return (
    <main className="max-w-lg mx-auto p-24">
      <form>
        <Card>
          <CardHeader>
            <h1 className="text-xl font-semibold">Login</h1>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Input label="Email" name="email" type="email" required />
            <Input label="Password" name="password" type="password" required />
          </CardBody>
          <Divider />
          <CardFooter className="flex justify-end gap-2">
            <Button type="submit" formAction={login} color="primary" fullWidth>
              Log in
            </Button>
            <Button
              type="submit"
              formAction={signup}
              color="secondary"
              fullWidth
            >
              Sign up
            </Button>
          </CardFooter>
        </Card>
      </form>
    </main>
  );
}
