import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const group = await prisma.group.findUnique({ where: { id: params.id } });
  if (!group) {
    return NextResponse.json(
      { error: "Grupo não encontrado." },
      { status: 404 },
    );
  }
  if (group.leaderId !== session.user.id) {
    return NextResponse.json(
      { error: "Apenas o líder pode ver isso." },
      { status: 403 },
    );
  }

  const pendingMembers = await prisma.groupMember.findMany({
    where: { groupId: params.id, status: "PENDING" },
    include: {
      user: { select: { id: true, name: true, image: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(pendingMembers);
}
