import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GroupCard from "@/components/groups/GroupCard";

export default async function GruposPage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const groups = await prisma.group.findMany({
    where: { status: "ACTIVE" },
    include: {
      leader: { select: { name: true, image: true } },
      _count: { select: { members: { where: { status: "ACTIVE" } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const memberships = userId
    ? await prisma.groupMember.findMany({
        where: { userId, groupId: { in: groups.map((g) => g.id) } },
        select: { groupId: true, status: true },
      })
    : [];

  const membershipMap = new Map(memberships.map((m) => [m.groupId, m.status]));

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">
            Comunidade
          </h1>
          <p className="text-sm text-gray-text mt-1">
            Grupos de oração e relacionamento
          </p>
        </div>
        {userId && (
          <Button asChild variant="primary" size="sm">
            <Link href="/grupos/novo">+ Criar Grupo</Link>
          </Button>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="bg-card rounded-xl p-10 text-center text-gray-text border border-gray-med/40">
          <p>Nenhum grupo ativo no momento.</p>
          {userId && (
            <Button asChild variant="primary" size="md" className="mt-4">
              <Link href="/grupos/novo">Solicitar criação de grupo</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              memberStatus={
                membershipMap.get(group.id) as
                  | "ACTIVE"
                  | "PENDING"
                  | "REJECTED"
                  | undefined
              }
              userId={userId}
            />
          ))}
        </div>
      )}
    </main>
  );
}
