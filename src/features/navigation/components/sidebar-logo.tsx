"use client";

import Logo from "$/features/branding/components/Logo";
import Symbol from "$/features/branding/components/Symbol";
import { useSidebar } from "$/components/ui/sidebar";

export default function SidebarLogo() {
  const { state } = useSidebar();

  return state === "collapsed" ? (
    <Symbol className="h-8 w-8" />
  ) : (
    <Logo className="h-8 w-24 min-w-24" />
  );
}
