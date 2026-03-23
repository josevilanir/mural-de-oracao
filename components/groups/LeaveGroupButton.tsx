"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { leaveGroup } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";

interface Props {
  groupId: string;
}

export default function LeaveGroupButton({ groupId }: Props) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLeave() {
    setLoading(true);
    setError(null);
    const result = await leaveGroup(groupId);
    setLoading(false);
    if (result.success) {
      router.push("/grupos");
    } else {
      setError(result.error ?? "Erro ao sair do grupo.");
      setConfirm(false);
    }
  }

  if (error) {
    return <span className="text-xs text-red-500">{error}</span>;
  }

  if (!confirm) {
    return (
      <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>
        Sair do grupo
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-red-600 font-medium">Tem certeza?</span>
      <Button
        variant="danger"
        size="sm"
        disabled={loading}
        onClick={handleLeave}
      >
        {loading ? "Saindo..." : "Confirmar"}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setConfirm(false)}
        disabled={loading}
      >
        Cancelar
      </Button>
    </div>
  );
}
