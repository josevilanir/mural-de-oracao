"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { requestPrayerRemoval } from "@/app/actions/groups";

interface Props {
  prayerId: string;
  groupId: string;
}

export default function PrayerRemovalForm({ prayerId, groupId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    await requestPrayerRemoval(prayerId, groupId, reason);
    setLoading(false);
    setDone(true);
    setOpen(false);
  }

  if (done) {
    return (
      <span className="text-xs text-orange-500 font-medium">Solicitado</span>
    );
  }

  return (
    <div className="flex-shrink-0">
      {!open ? (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          Solicitar Remoção
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 min-w-[200px]">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo da remoção..."
            rows={2}
            required
            className="border border-gray-med rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-gold-warm bg-background text-navy resize-none"
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading ? "..." : "Enviar"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
