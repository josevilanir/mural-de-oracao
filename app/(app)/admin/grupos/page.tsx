import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { approveGroup, rejectGroup } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";

export default async function AdminGruposPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (session.user.role !== "ADMIN") redirect("/");

  const pendingGroups = await prisma.group.findMany({
    where: { status: "PENDING" },
    include: {
      leader: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">🛡️ Admin — Aprovação de Grupos</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/prayers" className="text-sm text-red-200 hover:text-white">
            Pedidos
          </Link>
          <Link href="/admin/remocoes" className="text-sm text-red-200 hover:text-white">
            Remoções
          </Link>
          <Link href="/" className="text-sm text-red-200 hover:text-white">
            ← Voltar ao site
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <p className="text-sm text-gray-600 mb-4">
          Grupos aguardando aprovação: <strong>{pendingGroups.length}</strong>
        </p>

        {pendingGroups.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-sm border border-gray-200">
            Nenhum grupo pendente.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pendingGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900">{group.name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Líder: {group.leader.name} ({group.leader.email})
                    </p>
                    {group.description && (
                      <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Solicitado {formatRelativeDate(group.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <form
                      action={async () => {
                        "use server";
                        await approveGroup(group.id);
                      }}
                    >
                      <Button variant="primary" size="sm" type="submit">
                        Aprovar
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await rejectGroup(group.id);
                      }}
                    >
                      <Button variant="secondary" size="sm" type="submit">
                        Rejeitar
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
