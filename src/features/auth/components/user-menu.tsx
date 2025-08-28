"use client";

import { LogOut, Settings, User } from "lucide-react";
import { useCurrentUser } from "../api";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import Link from "$/components/ui/link";
import { logout } from "../actions";

export default function UserMenu() {
  const { user, isLoading } = useCurrentUser();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isLoading={isLoading}
          radius="full"
          variant="bordered"
          className="bg-background"
          startContent={<User className="w-5 h-5" />}
        >
          {user?.profile?.first_name}
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem
          as={Link}
          href="/dashboard/account"
          key="settings"
          startContent={<Settings className="w-4 h-4" />}
        >
          <span>Settings</span>
        </DropdownItem>
        <DropdownItem
          key="logout"
          onPress={logout}
          startContent={<LogOut className="w-4 h-4" />}
        >
          <span>Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
