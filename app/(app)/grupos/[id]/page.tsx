import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { sanitizePrayers } from "@/lib/utils";
import PrayerCard from "@/components/prayers/PrayerCard";

interface Props {
  params: { id: string };
  searchParams: { membersPage?: string };
}

export default async function GroupDetailPage({ params, searchParams }: Props) {
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  const membersPage = Math.max(1, parseInt(searchParams.membersPage ?? "1"));
  const membersLimit = 20;
  const membersSkip = (membersPage - 1) * membersLimit;

  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: {
      leader: { select: { id: true, name: true, image: true } },
      _count: { select: { members: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!group || group.status !== "ACTIVE") notFound();

  const membership = userId
    ? await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId, groupId: params.id } },
      })
    : null;

  const isMember = membership?.status === "ACTIVE";
  const isLeader = userId === group.leaderId;

  const [members, totalMembers, rawPrayers] = await Promise.all([
    prisma.groupMember.findMany({
      where: { groupId: params.id, status: "ACTIVE", user: { isDeleted: false } },
      include: { user: { select: { id: true, name: true, image: true } } },
      skip: membersSkip,
      take: membersLimit,
      orderBy: { joinedAt: "asc" },
    }),
    prisma.groupMember.count({ where: { groupId: params.id, status: "ACTIVE", user: { isDeleted: false } } }),
    prisma.prayer.findMany({
      where: {
        groupId: params.id,
        isHidden: false,
        ...(isMember ? {} : { visibility: "PUBLIC" }),
      },
      include: {
        author: { select: { name: true, image: true } },
        _count: { select: { actions: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const prayers = sanitizePrayers(rawPrayers);

  let prayedIds = new Set<string>();
  if (userId) {
    const prayedActions = await prisma.prayerAction.findMany({
      where: { userId, prayerId: { in: rawPrayers.map((p) => p.id) } },
      select: { prayerId: true },
    });
    prayedIds = new Set(prayedActions.map((a) => a.prayerId));
  }

  const totalMembersPages = Math.ceil(totalMembers / membersLimit);

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Group header */}
      <div className="bg-card rounded-xl border border-gray-med/40 shadow-sm p-6">
        <div className="flex items-start gap-4">
          {group.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={group.image}
              alt={group.name}
              className="w-16 h-16 rounded-full object-cover border border-gray-med flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gold-warm/20 flex items-center justify-center text-gold-warm text-2xl font-bold flex-shrink-0">
              {group.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-display font-bold text-navy">{group.name}</h1>
            <p className="text-sm text-gray-text">
              Líder: {group.leader.name} · {group._count.members} membro(s)
            </p>
            {group.description && (
              <p className="text-sm text-gray-text mt-2">{group.description}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            {isLeader && (
              <Button asChild variant="secondary" size="sm">
                <Link href={`/grupos/${params.id}/gerenciar`}>Gerenciar</Link>
              </Button>
            )}
            {!isMember && !isLeader && userId && membership?.status !== "PENDING" && (
              <form
                action={async () => {
                  "use server";
                  const { requestJoinGroup } = await import("@/app/actions/groups");
                  await requestJoinGroup(params.id);
                }}
              >
                <Button variant="primary" size="sm" type="submit">
                  Pedir pra participar
                </Button>
              </form>
            )}
            {membership?.status === "PENDING" && (
              <span className="text-xs text-gold-warm font-medium bg-gold-light px-3 py-1.5 rounded-full">
                Solicitação enviada
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Members card */}
        <div className="md:col-span-1">
          <div className="bg-card rounded-xl border border-gray-med/40 shadow-sm p-4 sticky top-6">
            <h2 className="font-semibold text-navy mb-3">Membros ({totalMembers})</h2>
            <div className="flex flex-col gap-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  {m.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.user.image}
                      alt={m.user.name ?? ""}
                      className="w-7 h-7 rounded-full object-cover border border-gray-med flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gold-warm/20 flex items-center justify-center text-gold-warm text-xs font-bold flex-shrink-0">
                      {m.user.name?.charAt(0) ?? "?"}
                    </div>
                  )}
                  <span className="text-sm text-navy truncate">{m.user.name}</span>
                  {m.user.id === group.leaderId && (
                    <span className="ml-auto text-xs text-gold-warm flex-shrink-0">líder</span>
                  )}
                </div>
              ))}
            </div>
            {totalMembersPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-med/40">
                {membersPage > 1 && (
                  <Link href={`/grupos/${params.id}?membersPage=${membersPage - 1}`} className="text-xs text-blue-main hover:underline">
                    ← Ant.
                  </Link>
                )}
                <span className="text-xs text-gray-text mx-auto">{membersPage}/{totalMembersPages}</span>
                {membersPage < totalMembersPages && (
                  <Link href={`/grupos/${params.id}?membersPage=${membersPage + 1}`} className="text-xs text-blue-main hover:underline">
                    Próx. →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Prayer feed — same grid as main feed */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy">
              Mural do Grupo
              {!isMember && (
                <span className="ml-2 text-xs text-gray-text font-normal">(apenas pedidos públicos)</span>
              )}
            </h2>
            {isMember && (
              <Button asChild variant="primary" size="sm">
                <Link href={`/novo-pedido?groupId=${params.id}`}>+ Novo Pedido</Link>
              </Button>
            )}
          </div>

          {prayers.length === 0 ? (
            <div className="bg-card rounded-xl border border-gray-med/40 p-8 text-center text-gray-text text-sm">
              Nenhum pedido ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {prayers.map((prayer) => (
                <PrayerCard
                  key={prayer.id}
                  prayer={prayer}
                  currentUserId={userId}
                  userHasPrayed={prayedIds.has(prayer.id)}
                  isOwner={!!userId && prayer.authorId === userId}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
