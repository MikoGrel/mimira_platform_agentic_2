"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

type Locale = "pl" | "en";

export async function setLocale(locale: Locale, currentPath?: string) {
  const cookieStore = await cookies();
  
  cookieStore.set("lingo-locale", locale, {
    httpOnly: false, // Allow client-side access if needed
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  // Revalidate the current path to refresh the layout
  if (currentPath) {
    revalidatePath(currentPath);
  } else {
    revalidatePath("/", "layout");
  }

  return { success: true };
}