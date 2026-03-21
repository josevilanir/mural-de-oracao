"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, Heart, Settings } from "lucide-react";

interface UserAccountNavProps {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
}

export function UserAccountNav({ name, email, image }: UserAccountNavProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-warm"
          aria-label="Menu do usuário"
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={name ?? "Avatar"}
              className="w-8 h-8 rounded-full border-2 border-gold-warm object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gold-warm flex items-center justify-center text-white text-sm font-bold select-none">
              {name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
          )}
          <span className="hidden md:inline text-sm font-medium text-navy truncate max-w-[120px]">
            {name}
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[200px] rounded-lg border border-gray-med bg-card shadow-lg py-1 animate-in fade-in-0 zoom-in-95"
        >
          {/* User info */}
          <div className="px-3 py-2 border-b border-gray-med">
            <p className="text-sm font-semibold text-navy truncate">{name}</p>
            <p className="text-xs text-gray-text truncate">{email}</p>
          </div>

          {/* Meus Pedidos */}
          <DropdownMenu.Item asChild>
            <Link
              href="/meus-pedidos"
              className="flex items-center gap-2 px-3 py-2 text-sm text-navy hover:bg-gray-light focus:bg-gray-light cursor-pointer outline-none"
            >
              <Heart className="w-4 h-4 text-gold-warm" />
              Meus Pedidos
            </Link>
          </DropdownMenu.Item>

          {/* Configurações de Perfil */}
          <DropdownMenu.Item asChild>
            <Link
              href="/meus-pedidos"
              className="flex items-center gap-2 px-3 py-2 text-sm text-navy hover:bg-gray-light focus:bg-gray-light cursor-pointer outline-none"
            >
              <Settings className="w-4 h-4 text-gray-text" />
              Configurações
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-gray-med" />

          {/* Sair */}
          <DropdownMenu.Item
            onSelect={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer outline-none focus:bg-red-50 dark:focus:bg-red-950/30"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
