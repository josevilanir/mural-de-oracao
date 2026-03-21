import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CATEGORY_LABELS, STATUS_LABELS, formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PrayerStatus } from "@/types/prisma";
import EditProfileModal from "@/components/user/EditProfileModal";
import ChangePasswordModal from "@/components/user/ChangePasswordModal";

export default async function MeusPedidosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/?callbackUrl=/meus-pedidos");

  const userId = session.user.id;

  const [prayers, totalPrayed, totalReceived, groupMemberships] = await Promise.all([
    prisma.prayer.findMany({
      where: { authorId: userId },
      include: {
        _count: { select: { actions: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.prayerAction.count({ where: { userId } }),
    prisma.prayerAction.count({
      where: { prayer: { authorId: userId } },
    }),
    prisma.groupMember.findMany({
      where: { userId, status: "ACTIVE" },
      include: {
        group: {
          include: {
            prayers: {
              where: { authorId: userId },
              include: { _count: { select: { actions: true } } },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    }),
  ]);

  const statusVariantMap: Record<PrayerStatus, "active" | "chronic" | "answered"> = {
    ACTIVE: "active",
    CHRONIC: "chronic",
    ANSWERED: "answered",
  };

  return (
    <>
      <main className="container mx-auto max-w-3xl px-4 py-8">
        {/* Profile Header */}
        <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border-2 border-gold-warm object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gold-warm flex items-center justify-center text-white text-xl font-bold">
                  {session.user.name?.charAt(0) ?? "U"}
                </div>
              )}
              <div>
                <h1 className="font-display text-xl font-bold text-navy">
                  {session.user.name}
                </h1>
                <p className="text-sm text-gray-text">{session.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <EditProfileModal
                initialName={session.user.name}
                initialImage={session.user.image}
              />
              <ChangePasswordModal />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Pedidos Publicados", value: prayers.length },
              { label: "Orações Recebidas", value: totalReceived },
              { label: "Orações que Fiz", value: totalPrayed },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-light rounded-lg p-3">
                <p className="text-2xl font-bold text-navy">{stat.value}</p>
                <p className="text-xs text-gray-text mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Prayer List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-navy">Seus Pedidos de Oração</h2>
          <Button asChild variant="primary" size="sm">
            <Link href="/novo-pedido">+ Novo Pedido</Link>
          </Button>
        </div>

        {prayers.length === 0 ? (
          <div className="bg-card rounded-lg p-8 text-center text-gray-text">
            <p>Você ainda não publicou nenhum pedido. Que tal compartilhar uma necessidade?</p>
            <Button asChild variant="primary" size="md" className="mt-4">
              <Link href="/novo-pedido">Criar primeiro pedido</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {prayers.map((prayer) => {
              const cat = CATEGORY_LABELS[prayer.category];
              const status = STATUS_LABELS[prayer.status];
              return (
                <div
                  key={prayer.id}
                  className="bg-card rounded-lg p-4 border border-gray-med/40 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-text">
                        {cat?.label}
                      </span>
                      <span className="font-semibold text-navy text-base">
                        {prayer.title}
                      </span>
                    </div>
                    <Badge variant={statusVariantMap[prayer.status as PrayerStatus]}>
                      {status?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-text line-clamp-2 mb-3">
                    {prayer.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-gray-text">
                      {formatRelativeDate(prayer.createdAt)} · {prayer._count.actions} orações
                    </span>
                    <div className="ml-auto flex gap-2">
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/pedido/${prayer.id}`}>Ver Detalhes</Link>
                      </Button>
                      {prayer.status !== "ANSWERED" && (
                        <Button asChild variant="primary" size="sm">
                          <Link href={`/pedido/${prayer.id}/resolver`}>
                            Marcar como Respondido
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Group prayers section */}
        {groupMemberships.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-navy mb-4">Meus Pedidos nos Grupos</h2>
            <div className="flex flex-col gap-6">
              {groupMemberships.map((membership) => {
                const group = membership.group;
                if (group.prayers.length === 0) return null;
                return (
                  <div key={group.id}>
                    <h3 className="font-medium text-navy mb-2 text-sm">
                      📍 {group.name}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {group.prayers.map((prayer) => {
                        const cat = CATEGORY_LABELS[prayer.category];
                        return (
                          <div
                            key={prayer.id}
                            className="bg-card rounded-lg p-3 border border-gray-med/40 shadow-sm"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-gray-text">{cat?.label}</span>
                              <span className="font-medium text-navy text-sm">{prayer.title}</span>
                              <span
                                className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                                  prayer.visibility === "GROUP_ONLY"
                                    ? "bg-gold-light text-gold-warm"
                                    : "bg-green-50 text-green-600"
                                }`}
                              >
                                {prayer.visibility === "GROUP_ONLY" ? "Só pro grupo" : "Público"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-text">
                                {formatRelativeDate(prayer.createdAt)} · {prayer._count.actions} orações
                              </span>
                              <Button asChild variant="secondary" size="sm" className="ml-auto">
                                <Link href={`/pedido/${prayer.id}`}>Ver</Link>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
