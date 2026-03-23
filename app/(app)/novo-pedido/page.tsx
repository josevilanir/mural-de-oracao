import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewPrayerForm from "@/components/prayers/NewPrayerForm";

interface Props {
  searchParams: { groupId?: string };
}

export default async function NovoPedidoPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: { group: { select: { id: true, name: true } } },
  });

  const groups = memberships.map((m) => ({
    id: m.group.id,
    name: m.group.name,
  }));

  return (
    <>
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-navy mb-2">
          Criar Novo Pedido de Oração
        </h1>
        <p className="text-sm text-gray-text italic mb-6">
          A comunidade está aqui para orar por você
        </p>
        <div className="bg-card rounded-xl shadow-sm p-6">
          <NewPrayerForm
            groups={groups}
            defaultGroupId={searchParams.groupId}
          />
        </div>
      </main>
    </>
  );
}
