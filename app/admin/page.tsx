import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";
import { approveGroup, rejectGroup, resolvePrayerRemoval, deleteGroup } from "@/app/actions/groups";
import AdminToggle from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/utils";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  const [prayers, pendingGroups, activeGroups, removalRequests] = await Promise.all([
    prisma.prayer.findMany({
      include: {
        author: { select: { name: true, email: true } },
        _count: { select: { reports: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.group.findMany({
      where: { status: "PENDING" },
      include: { leader: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.group.findMany({
      where: { status: "ACTIVE" },
      include: {
        leader: { select: { name: true, email: true } },
        _count: { select: { members: { where: { status: "ACTIVE" } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.prayerRemovalRequest.findMany({
      where: { resolved: false },
      include: {
        prayer: { select: { id: true, title: true } },
        group: { select: { id: true, name: true } },
        leader: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">🛡️ Painel de Moderação — Mural de Oração</h1>
        <Link href="/" className="text-sm text-red-200 hover:text-white">
          ← Voltar ao site
        </Link>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-10">

        {/* ── Seção 1: Grupos pendentes ── */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            👥 Grupos aguardando aprovação
            {pendingGroups.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingGroups.length}
              </span>
            )}
          </h2>

          {pendingGroups.length === 0 ? (
            <p className="text-sm text-gray-500 bg-white rounded-lg border border-gray-200 p-4">
              Nenhum grupo pendente.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{group.name}</p>
                    <p className="text-sm text-gray-500">
                      Líder: {group.leader.name} ({group.leader.email})
                    </p>
                    {group.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{group.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatRelativeDate(group.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <form action={async () => { "use server"; await approveGroup(group.id); }}>
                      <Button variant="primary" size="sm" type="submit">Aprovar</Button>
                    </form>
                    <form action={async () => { "use server"; await rejectGroup(group.id); }}>
                      <Button variant="secondary" size="sm" type="submit">Rejeitar</Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Seção 2: Grupos ativos ── */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">
            ✅ Grupos ativos ({activeGroups.length})
          </h2>
          {activeGroups.length === 0 ? (
            <p className="text-sm text-gray-500 bg-white rounded-lg border border-gray-200 p-4">
              Nenhum grupo ativo.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {activeGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      <Link href={`/grupos/${group.id}`} className="hover:underline text-blue-600">
                        {group.name}
                      </Link>
                    </p>
                    <p className="text-sm text-gray-500">
                      Líder: {group.leader.name} · {group._count.members} membro(s)
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatRelativeDate(group.createdAt)}</p>
                  </div>
                  <form action={async () => { "use server"; await deleteGroup(group.id); }}>
                    <Button variant="danger" size="sm" type="submit">Apagar</Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Seção 3: Remoções pendentes ── */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            🗑️ Solicitações de remoção de pedido
            {removalRequests.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {removalRequests.length}
              </span>
            )}
          </h2>

          {removalRequests.length === 0 ? (
            <p className="text-sm text-gray-500 bg-white rounded-lg border border-gray-200 p-4">
              Nenhuma solicitação pendente.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {removalRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      Pedido:{" "}
                      <Link href={`/pedido/${req.prayer.id}`} className="text-blue-600 hover:underline">
                        {req.prayer.title}
                      </Link>
                    </p>
                    <p className="text-sm text-gray-500">
                      Grupo: {req.group.name} · Líder: {req.leader.name}
                    </p>
                    <div className="text-sm text-gray-700 bg-gray-50 rounded p-2 mt-1">
                      <span className="font-medium">Motivo: </span>{req.reason}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{formatRelativeDate(req.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <form action={async () => { "use server"; await resolvePrayerRemoval(req.id, true); }}>
                      <Button variant="primary" size="sm" type="submit">Confirmar Remoção</Button>
                    </form>
                    <form action={async () => { "use server"; await resolvePrayerRemoval(req.id, false); }}>
                      <Button variant="secondary" size="sm" type="submit">Restaurar</Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Seção 4: Moderação de pedidos ── */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">
            📋 Pedidos de oração ({prayers.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-3">Título</th>
                  <th className="text-left px-4 py-3">Autor (real)</th>
                  <th className="text-left px-4 py-3">Categoria</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Reports</th>
                  <th className="text-left px-4 py-3">Visível</th>
                  <th className="text-left px-4 py-3">Data</th>
                  <th className="text-left px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {prayers.map((prayer: any) => {
                  const cat = CATEGORY_LABELS[prayer.category];
                  const status = STATUS_LABELS[prayer.status];
                  return (
                    <tr key={prayer.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 max-w-xs">
                        <span className="line-clamp-1 font-medium text-navy">{prayer.title}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {prayer.author.name ?? "—"}
                        <br />
                        <span className="text-xs text-gray-400">{prayer.author.email}</span>
                      </td>
                      <td className="px-4 py-3">{cat?.emoji} {cat?.label}</td>
                      <td className="px-4 py-3">{status?.emoji} {status?.label}</td>
                      <td className="px-4 py-3">
                        {prayer._count.reports > 0 ? (
                          <span className="bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-bold">
                            {prayer._count.reports}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <AdminToggle prayerId={prayer.id} initialHidden={prayer.isHidden} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatRelativeDate(prayer.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/pedido/${prayer.id}`} className="text-blue-main hover:underline text-xs">
                          👁 Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
