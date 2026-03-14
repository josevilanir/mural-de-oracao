import { auth } from "@/lib/auth";
import { AppSidebarClient } from "./AppSidebarClient";

export default async function AppSidebar() {
  const session = await auth();
  const user = session?.user ?? null;

  return (
    <AppSidebarClient
      user={user ? { name: user.name ?? null, email: user.email ?? null, image: user.image ?? null, role: (user as any).role ?? "USER" } : null}
    />
  );
}
