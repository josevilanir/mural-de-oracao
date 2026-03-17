import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { approveJoinRequest, rejectJoinRequest, requestPrayerRemoval } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/utils";
import PrayerRemovalForm from "./PrayerRemovalForm";
import DeleteGroupButton from "@/components/groups/DeleteGroupButton";

interface Props {
  params: { id: string };
}

export default async function GerenciarGrupoPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: { leader: { select: { id: true, name: true } } },
  });

  if (!group) notFound();
  if (group.leaderId !== session.user.id) redirect(`/grupos/${params.id}`);

  const [pendingMembers, groupPrayers] = await Promise.all([
    prisma.groupMember.findMany({
      where: { groupId: params.id, status: "PENDING", user: { isDeleted: false } },
      include: { user: { select: { id: true, name: true, image: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.prayer.findMany({
      where: { groupId: params.id, isHidden: false },
      include: {
        author: { select: { name: true } },
        _count: { select: { actions: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-navy">Gerenciar: {group.name}</h1>
        <DeleteGroupButton groupId={params.id} redirectTo="/grupos" />
      </div>

      {/* Pending members */}
      <section>
        <h2 className="font-semibold text-navy mb-3">
          Solicitações de Entrada ({pendingMembers.length})
        </h2>
        {pendingMembers.length === 0 ? (
          <p className="text-sm text-gray-text bg-card rounded-xl border border-gray-med/40 p-5 text-center">
            Nenhuma solicitação pendente.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingMembers.map((m) => (
              <div
                key={m.id}
                className="bg-card rounded-xl border border-gray-med/40 shadow-sm p-4 flex items-center gap-3"
              >
                {m.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.user.image}
                    alt={m.user.name ?? ""}
                    className="w-9 h-9 rounded-full object-cover border border-gray-med flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gold-warm/20 flex items-center justify-center text-gold-warm font-bold flex-shrink-0">
                    {m.user.name?.charAt(0) ?? "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy text-sm">{m.user.name}</p>
                  <p className="text-xs text-gray-text">{m.user.email}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <form
                    action={async () => {
                      "use server";
                      await approveJoinRequest(m.id);
                    }}
                  >
                    <Button variant="primary" size="sm" type="submit">Aprovar</Button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await rejectJoinRequest(m.id);
                    }}
                  >
                    <Button variant="secondary" size="sm" type="submit">Rejeitar</Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Group prayers with removal option */}
      <section>
        <h2 className="font-semibold text-navy mb-3">
          Pedidos do Grupo ({groupPrayers.length})
        </h2>
        {groupPrayers.length === 0 ? (
          <p className="text-sm text-gray-text bg-card rounded-xl border border-gray-med/40 p-5 text-center">
            Nenhum pedido neste grupo.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {groupPrayers.map((prayer) => {
              const cat = CATEGORY_LABELS[prayer.category];
              return (
                <div
                  key={prayer.id}
                  className="bg-card rounded-xl border border-gray-med/40 shadow-sm p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-gray-text">{cat?.emoji} {cat?.label}</span>
                      </div>
                      <p className="font-semibold text-navy text-sm">{prayer.title}</p>
                      <p className="text-xs text-gray-text mt-0.5">
                        Por: {prayer.author.name} · {prayer._count.actions} orações
                      </p>
                    </div>
                    <PrayerRemovalForm prayerId={prayer.id} groupId={params.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
