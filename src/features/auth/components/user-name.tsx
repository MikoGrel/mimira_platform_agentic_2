"use client";

import useCurrentUser from "../hooks/use-current-user";

export default function UserName() {
  const { user } = useCurrentUser();

  return <div>{user?.email}</div>;
}
