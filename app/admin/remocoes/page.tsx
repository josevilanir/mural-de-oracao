import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { resolvePrayerRemoval } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";

export default async function AdminRemocoesPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  const requests = await prisma.prayerRemovalRequest.findMany({
    where: { resolved: false },
    include: {
      prayer: { select: { id: true, title: true } },
      group: { select: { id: true, name: true } },
      leader: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">🛡️ Admin — Solicitações de Remoção</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/prayers" className="text-sm text-red-200 hover:text-white">
            Pedidos
          </Link>
          <Link href="/admin/grupos" className="text-sm text-red-200 hover:text-white">
            Grupos
          </Link>
          <Link href="/" className="text-sm text-red-200 hover:text-white">
            ← Voltar ao site
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <p className="text-sm text-gray-600 mb-4">
          Solicitações pendentes: <strong>{requests.length}</strong>
        </p>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-sm border border-gray-200">
            Nenhuma solicitação pendente.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900">
                      Pedido:{" "}
                      <Link
                        href={`/pedido/${req.prayer.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {req.prayer.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Grupo: {req.group.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Líder: {req.leader.name} ({req.leader.email})
                    </p>
                    <div className="mt-2 bg-gray-50 rounded p-2 text-sm text-gray-700">
                      <span className="font-medium">Motivo: </span>
                      {req.reason}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Solicitado {formatRelativeDate(req.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <form
                      action={async () => {
                        "use server";
                        await resolvePrayerRemoval(req.id, true);
                      }}
                    >
                      <Button variant="primary" size="sm" type="submit">
                        Confirmar Remoção
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await resolvePrayerRemoval(req.id, false);
                      }}
                    >
                      <Button variant="secondary" size="sm" type="submit">
                        Restaurar Pedido
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
