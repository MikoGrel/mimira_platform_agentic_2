"use client";

import { useCurrentUser } from "../api";

export default function UserName() {
  const { user } = useCurrentUser();

  return <div>{user?.profile?.first_name}</div>;
}
