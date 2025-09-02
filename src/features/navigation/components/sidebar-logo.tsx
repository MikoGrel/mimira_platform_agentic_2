"use client";

import Logo from "$/features/branding/components/Logo";
import Symbol from "$/features/branding/components/Symbol";
import { useSidebar } from "$/components/ui/sidebar";
import Link from "$/components/ui/link";

export default function SidebarLogo() {
  const { state } = useSidebar();

  return (
    <Link href="/dashboard" className="flex justify-start w-full">
      {state === "collapsed" && <Symbol className="h-8 w-8 ml-2" />}
      {state !== "collapsed" && <Logo className="h-8 w-24 min-w-24" />}
    </Link>
  );
}
