"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Heart, MessageSquare, GripHorizontal, Users } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

type NotificationType =
  | "PRAYER_CLICK"
  | "COMMENT_ADDED"
  | "GROUP_JOIN_REQUEST"
  | "GROUP_REQUEST_APPROVED"
  | "GROUP_REQUEST_REJECTED"
  | "GROUP_CREATION_APPROVED"
  | "GROUP_CREATION_REJECTED"
  | "GROUP_PRAYER_REMOVAL_REQUEST";

interface Notification {
  id: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  actor?: { name: string | null; image: string | null } | null;
  prayer?: { id: string; title: string } | null;
  group?: { id: string; name: string } | null;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // null = anchored to button; {x,y} = floating (after drag)
  const [floatPos, setFloatPos] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
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
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click (only when anchored)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (floatPos) return; // floating panels stay open until explicitly closed
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [floatPos]);

  // Reset float position when panel closes
  useEffect(() => {
    if (!open) setFloatPos(null);
  }, [open]);

  function handleOpen() {
    setOpen((v) => !v);
    if (!open && unread > 0) markAllRead();
  }

  // Drag: capture initial position on mousedown of the handle
  function handleDragStart(e: React.MouseEvent) {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    dragging.current = true;

    // If still anchored, snapshot current screen position and switch to floating
    setFloatPos({ x: rect.left, y: rect.top });

    function onMouseMove(ev: MouseEvent) {
      if (!dragging.current) return;
      setFloatPos({
        x: ev.clientX - dragOffset.current.x,
        y: ev.clientY - dragOffset.current.y,
      });
    }

    function onMouseUp() {
      dragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    e.preventDefault();
  }

  function getNotificationText(n: Notification) {
    const actor = n.actor?.name ?? "Alguém";
    const group = n.group?.name ?? "seu grupo";
    const prayer = n.prayer?.title ?? "um pedido";
    switch (n.type) {
      case "PRAYER_CLICK":        return `${actor} orou pelo seu pedido "${prayer}"`;
      case "COMMENT_ADDED":       return `${actor} comentou no seu pedido "${prayer}"`;
      case "GROUP_CREATION_APPROVED": return `🎉 Parabéns! Seu grupo "${group}" foi aprovado!`;
      case "GROUP_CREATION_REJECTED": return `Seu pedido de criação do grupo "${group}" foi recusado.`;
      case "GROUP_JOIN_REQUEST":  return `${actor} pediu para entrar no grupo "${group}"`;
      case "GROUP_REQUEST_APPROVED": return `✅ Sua solicitação para entrar no grupo "${group}" foi aprovada!`;
      case "GROUP_REQUEST_REJECTED": return `Sua solicitação para entrar no grupo "${group}" foi recusada.`;
      case "GROUP_PRAYER_REMOVAL_REQUEST": return `${actor} solicitou a remoção do pedido "${prayer}" no grupo "${group}"`;
    }
  }

  const isFloating = floatPos !== null;

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
        <div
          ref={panelRef}
          className={cn(
            "notification-panel w-80 bg-card border border-gray-med rounded-xl shadow-lg z-50 overflow-hidden",
            isFloating ? "fixed" : "absolute left-0 top-12"
          )}
          style={isFloating ? { left: floatPos.x, top: floatPos.y } : undefined}
        >
          {/* Drag handle — header */}
          <div
            onMouseDown={handleDragStart}
            className="flex items-center justify-between px-4 py-3 border-b border-gray-med cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-gray-text opacity-50" />
              <span className="font-semibold text-navy text-sm">Notificações</span>
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={markAllRead}
                  className="text-xs text-blue-main hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
              {isFloating && (
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setOpen(false)}
                  className="text-xs text-gray-text hover:text-navy ml-1"
                  aria-label="Fechar"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 && (
              <p className="text-center text-sm text-gray-text py-6">Carregando...</p>
            )}
            {!loading && notifications.length === 0 && (
              <p className="text-center text-sm text-gray-text py-6">Nenhuma notificação ainda</p>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={
                  n.prayer ? `/pedido/${n.prayer.id}`
                  : n.group ? `/grupos/${n.group.id}`
                  : "#"
                }
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 hover:bg-gray-light transition-colors border-b border-gray-med/40 last:border-0",
                  !n.isRead && "bg-blue-soft/40"
                )}
              >
                <span className="mt-0.5 text-gray-text">
                  {n.type === "PRAYER_CLICK" ? (
                    <Heart className="w-4 h-4 text-gold-warm" />
                  ) : n.type === "COMMENT_ADDED" ? (
                    <MessageSquare className="w-4 h-4 text-blue-main" />
                  ) : (
                    <Users className="w-4 h-4 text-navy" />
                  )}
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
