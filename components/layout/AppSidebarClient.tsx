"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  Home,
  PlusCircle,
  BookOpen,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { cn } from "@/lib/utils";

interface Props {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  } | null;
}

export function AppSidebarClient({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    {
      label: "Mural",
      href: "/",
      icon: <Home className="h-5 w-5 flex-shrink-0 text-navy" />,
    },
    {
      label: "Comunidade",
      href: "/grupos",
      icon: <Users className="h-5 w-5 flex-shrink-0 text-navy" />,
    },
    ...(user
      ? [
          {
            label: "Novo Pedido",
            href: "/novo-pedido",
            icon: <PlusCircle className="h-5 w-5 flex-shrink-0 text-navy" />,
          },
          {
            label: "Meus Pedidos",
            href: "/meus-pedidos",
            icon: <BookOpen className="h-5 w-5 flex-shrink-0 text-navy" />,
          },
        ]
      : []),
    ...(user?.role === "ADMIN"
      ? [
          {
            label: "Admin",
            href: "/admin",
            icon: (
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-gold-warm" />
            ),
          },
        ]
      : []),
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody
        className={cn(
          "justify-between gap-6 bg-card border-r border-gray-med dark:border-gray-med h-screen sticky top-0",
        )}
      >
        {/* Top section */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          {open ? (
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-lg font-bold text-navy dark:text-[#f1f5f9] dark:tracking-[0.02em] py-1"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-nowrap"
              >
                Mural de Oração
              </motion.span>
            </Link>
          ) : (
            <Link
              href="/"
              className="w-full flex items-center justify-center py-1"
            >
              <span className="font-bold text-gold-warm text-lg">M</span>
            </Link>
          )}

          {/* Nav links */}
          <div className="mt-8 flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <SidebarLink
                  key={link.href}
                  link={link}
                  className={cn(
                    "hover:bg-blue-soft dark:hover:bg-navy/40 text-navy dark:text-[#94a3b8] dark:hover:text-[#e2e8f0] rounded-lg transition-colors dark:[&_svg]:opacity-60 dark:[&_svg]:transition-opacity",
                    isActive &&
                      "bg-gold-light dark:bg-gold-warm/20 text-gold-warm dark:text-white font-semibold dark:font-semibold dark:[&_svg]:!opacity-100",
                  )}
                />
              );
            })}
          </div>

          {/* Theme toggle */}
          <div className="mt-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "flex items-center px-2 py-2 w-full rounded-md hover:bg-blue-soft dark:hover:bg-navy/40 transition-colors group/sidebar",
                open ? "gap-3 justify-start" : "justify-center",
              )}
            >
              {mounted && (
                <>
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 flex-shrink-0 text-navy" />
                  ) : (
                    <Moon className="h-5 w-5 flex-shrink-0 text-navy" />
                  )}
                  <motion.span
                    animate={{
                      display: open ? "inline-block" : "none",
                      opacity: open ? 1 : 0,
                    }}
                    className="text-sm text-navy dark:text-[#94a3b8] group-hover/sidebar:dark:text-[#e2e8f0] group-hover/sidebar:translate-x-1 transition-[color,transform] duration-150 whitespace-pre"
                  >
                    {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                  </motion.span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom section — user ou login */}
        <div className="flex flex-col gap-2 pb-2">
          {user ? (
            <>
              {/* Notification Bell — só mostra label quando aberto */}
              <div
                className={cn(
                  "flex items-center gap-3 px-2 py-1",
                  !open && "justify-center",
                )}
              >
                <NotificationBell />
                <motion.span
                  animate={{
                    display: open ? "inline-block" : "none",
                    opacity: open ? 1 : 0,
                  }}
                  className="text-sm dark:text-[#64748b] dark:text-[0.8rem] text-navy whitespace-pre transition-colors"
                >
                  Notificações
                </motion.span>
              </div>

              {/* User avatar + name */}
              <div
                className={cn(
                  "flex items-center gap-3 px-2 py-2",
                  !open && "justify-center",
                )}
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "Avatar"}
                    width={32}
                    height={32}
                    className="w-8 h-8 min-w-[32px] rounded-full flex-shrink-0 aspect-square border border-gray-med object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gold-warm flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0) ?? "U"}
                  </div>
                )}
                <motion.div
                  animate={{
                    display: open ? "flex" : "none",
                    opacity: open ? 1 : 0,
                  }}
                  className="flex flex-col min-w-0"
                >
                  <span className="text-sm font-semibold text-navy dark:text-[#e2e8f0] dark:font-semibold truncate transition-colors">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-text dark:text-[#64748b] truncate transition-colors">
                    {user.email}
                  </span>
                </motion.div>
              </div>

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={cn(
                  "flex items-center px-2 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group/sidebar w-full text-left",
                  open ? "gap-3 justify-start" : "justify-center",
                )}
              >
                <LogOut className="h-5 w-5 flex-shrink-0 text-red-500" />
                <motion.span
                  animate={{
                    display: open ? "inline-block" : "none",
                    opacity: open ? 1 : 0,
                  }}
                  className="text-sm text-red-500 dark:font-medium group-hover/sidebar:translate-x-1 transition-[color,transform] duration-150 whitespace-pre"
                >
                  Sair
                </motion.span>
              </button>
            </>
          ) : (
            <>
              <SidebarLink
                link={{
                  label: "Entrar",
                  href: "/login",
                  icon: <LogIn className="h-5 w-5 flex-shrink-0 text-navy" />,
                }}
                className="hover:bg-blue-soft dark:hover:bg-navy/40 text-navy rounded-lg"
              />
              <SidebarLink
                link={{
                  label: "Criar Conta",
                  href: "/register",
                  icon: (
                    <UserPlus className="h-5 w-5 flex-shrink-0 text-gold-warm" />
                  ),
                }}
                className="hover:bg-gold-light dark:hover:bg-gold-warm/20 rounded-lg"
              />
            </>
          )}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
