import Link from "next/link";
import { auth } from "@/lib/auth";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserAccountNav } from "@/components/layout/UserAccountNav";

export default async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 h-16 bg-cream/95 backdrop-blur border-b border-gray-med flex items-center px-4 gap-4">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-display text-lg font-bold text-navy shrink-0"
      >
        <span className="hidden sm:inline">Mural de Oração</span>
      </Link>

      {/* Search (placeholder) */}
      <div className="flex-1 max-w-lg mx-auto">
        <input
          type="search"
          placeholder="Buscar pedidos por título, categoria..."
          className="w-full h-9 px-3 rounded-md border border-gray-med bg-card text-sm text-navy placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-gold-warm"
          readOnly
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />
        {user ? (
          <>
            <button className="relative p-2 rounded-full hover:bg-gray-light transition-colors">
              <Bell className="w-5 h-5 text-navy" />
            </button>
            <UserAccountNav
              name={user.name}
              email={user.email}
              image={user.image}
            />
          </>
        ) : (
          <>
            <Button asChild variant="secondary" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/register">Criar Conta</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
