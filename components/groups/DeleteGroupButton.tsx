"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteGroup } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";

interface Props {
  groupId: string;
  redirectTo?: string;
}

export default function DeleteGroupButton({
  groupId,
  redirectTo = "/grupos",
}: Props) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    const result = await deleteGroup(groupId);
    setLoading(false);
    if (result.success) {
      router.push(redirectTo);
    }
  }

  if (!confirm) {
    return (
      <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>
        Apagar grupo
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
        onClick={handleDelete}
      >
        {loading ? "Apagando..." : "Confirmar"}
      </Button>
      <Button variant="secondary" size="sm" onClick={() => setConfirm(false)}>
        Cancelar
      </Button>
    </div>
  );
}
