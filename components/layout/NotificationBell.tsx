"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "PRAYER_CLICK" | "COMMENT_ADDED";
  isRead: boolean;
  createdAt: string;
  actor?: { name: string | null; image: string | null } | null;
  prayer?: { id: string; title: string } | null;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.isRead).length;

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  useEffect(() => {
    fetchNotifications();
    // Polling a cada 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleOpen() {
    setOpen((v) => !v);
    if (!open && unread > 0) markAllRead();
  }

  function getNotificationText(n: Notification) {
    const actor = n.actor?.name ?? "Alguém";
    if (n.type === "PRAYER_CLICK") return `${actor} orou pelo seu pedido "${n.prayer?.title}"`;
    if (n.type === "COMMENT_ADDED") return `${actor} comentou no seu pedido "${n.prayer?.title}"`;
    return "Nova notificação";
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-gray-light transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5 text-navy" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-gold-warm text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-card border border-gray-med rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-med">
            <span className="font-semibold text-navy text-sm">Notificações</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-main hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 && (
              <p className="text-center text-sm text-gray-text py-6">Carregando...</p>
            )}
            {!loading && notifications.length === 0 && (
              <p className="text-center text-sm text-gray-text py-6">Nenhuma notificação ainda 🕊️</p>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.prayer ? `/pedido/${n.prayer.id}` : "#"}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 hover:bg-gray-light transition-colors border-b border-gray-med/40 last:border-0",
                  !n.isRead && "bg-blue-soft/40"
                )}
              >
                <span className="text-xl mt-0.5">
                  {n.type === "PRAYER_CLICK" ? "🙏" : "💬"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-navy line-clamp-2">
                    {getNotificationText(n)}
                  </p>
                  <p className="text-xs text-gray-text mt-0.5">
                    {formatRelativeDate(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-gold-warm mt-1.5 flex-shrink-0" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
