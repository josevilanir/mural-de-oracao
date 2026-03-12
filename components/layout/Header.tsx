import Link from "next/link";
import { auth } from "@/lib/auth";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 h-16 bg-cream/95 backdrop-blur border-b border-gray-med flex items-center px-4 gap-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-navy shrink-0">
        🙏 <span className="hidden sm:inline">Mural de Oração</span>
      </Link>

      {/* Search (placeholder) */}
      <div className="flex-1 max-w-lg mx-auto">
        <input
          type="search"
          placeholder="Buscar pedidos por título, categoria..."
          className="w-full h-9 px-3 rounded-md border border-gray-med bg-white text-sm text-navy placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-gold-warm"
          readOnly
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {user ? (
          <>
            <button className="relative p-2 rounded-full hover:bg-gray-light transition-colors">
              <Bell className="w-5 h-5 text-navy" />
            </button>
            <div className="flex items-center gap-2">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "Avatar"}
                  className="w-8 h-8 rounded-full border-2 border-gold-warm object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gold-warm flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.charAt(0) ?? "U"}
                </div>
              )}
              <span className="hidden md:inline text-sm font-medium text-navy truncate max-w-[120px]">
                {user.name}
              </span>
            </div>
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
