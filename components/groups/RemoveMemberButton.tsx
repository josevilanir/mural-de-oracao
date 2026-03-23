"use client";

import { useState } from "react";
import { removeGroupMember } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";

interface Props {
  memberId: string;
  memberName: string;
}

export default function RemoveMemberButton({ memberId, memberName }: Props) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    setLoading(true);
    setError(null);
    const result = await removeGroupMember(memberId);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Erro ao remover membro.");
      setConfirm(false);
    }
  }

  if (error) {
    return <span className="text-xs text-red-500">{error}</span>;
  }

  if (!confirm) {
    return (
      <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>
        Remover
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-red-600 font-medium">
        Remover {memberName}?
      </span>
      <Button
        variant="danger"
        size="sm"
        disabled={loading}
        onClick={handleRemove}
      >
        {loading ? "..." : "Confirmar"}
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
