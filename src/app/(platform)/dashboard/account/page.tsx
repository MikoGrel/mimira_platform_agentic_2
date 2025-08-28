import { AccessForm } from "$/features/auth/components/access-form";
import { ProfileForm } from "$/features/auth/components/profile-form";

export default function AccountPage() {
  return (
    <main className="h-full bg-primary-gradient w-full">
      <section className="max-w-3xl mx-auto p-4 lg:pt-12 space-y-4">
        <h1 className="text-3xl font-semibold font-heading">
          Account settings
        </h1>
        <ProfileForm />
        <AccessForm />
      </section>
    </main>
  );
}
