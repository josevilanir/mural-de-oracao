import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS, STATUS_LABELS, formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import AdminToggle from "@/components/admin/AdminToggle";

export default async function AdminPrayersPage() {
  const session = await auth();

  if (!session?.user) redirect("/");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  const prayers = await prisma.prayer.findMany({
    include: {
      author: { select: { name: true, email: true } },
      _count: { select: { reports: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-red-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">🛡️ Painel de Moderação — Mural de Oração</h1>
        <Link href="/" className="text-sm text-red-200 hover:text-white">
          ← Voltar ao site
        </Link>
      </header>

      <main className="container mx-auto px-4 py-6">
        <p className="text-sm text-gray-600 mb-4">
          Total de pedidos: <strong>{prayers.length}</strong>
        </p>

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
                      <span className="line-clamp-1 font-medium text-navy">
                        {prayer.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {prayer.author.name ?? "—"}
                      <br />
                      <span className="text-xs text-gray-400">{prayer.author.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      {cat?.emoji} {cat?.label}
                    </td>
                    <td className="px-4 py-3">
                      {status?.emoji} {status?.label}
                    </td>
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
                      <AdminToggle
                        prayerId={prayer.id}
                        initialHidden={prayer.isHidden}
                      />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatRelativeDate(prayer.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/pedido/${prayer.id}`}
                        className="text-blue-main hover:underline text-xs"
                      >
                        👁 Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
