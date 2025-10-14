import { AccessForm } from "$/features/auth/components/access-form";
import { ProfileForm } from "$/features/auth/components/profile-form";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";

export default function AccountPage() {
  return (
    <main className="h-full bg-primary-gradient w-full">
      <section className="max-w-3xl mx-auto p-4 lg:pt-12 space-y-4">
        <h1 className="text-3xl font-semibold font-heading">
          Account settings
        </h1>
        <ProfileForm />
        <AccessForm />
        <Card shadow="none" className="border">
          <CardHeader className="font-medium">Contact us</CardHeader>
          <Divider />
          <CardBody className="space-y-2">
            <div className="text-sm">
              <div className="mt-1 space-y-1">
                <p>
                  <span className="font-medium">Email: </span>
                  <a
                    href="mailto:mimira@mimiraoffers.eu"
                    className="text-primary underline"
                  >
                    mimira@mimiraoffers.eu
                  </a>
                </p>
                <p>
                  <span className="font-medium">Tel: </span>
                  <a href="tel:+48732070469" className="text-primary underline">
                    +48 732 070 469
                  </a>
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              If you have questions about a specific tender, remember that you
              can ask the chatbot.
            </p>
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
