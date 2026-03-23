/**
 * Prisma Seed Script
 *
 * Cria dados iniciais para desenvolvimento e testes.
 * Executar: npx prisma db seed
 *
 * Idempotente: usa upsert onde possível e limpa dados não-auth antes de recriar.
 */

import {
  PrismaClient,
  Role,
  Category,
  PrayerStatus,
  GroupStatus,
  GroupMemberStatus,
  PrayerVisibility,
  AuditAction,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ─── Seed Principal ───────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // ── 1. Limpar dados não-auth para evitar conflitos em re-execuções ──────────
  console.log("🧹 Limpando dados de seed anteriores...");
  await prisma.auditLog.deleteMany();
  await prisma.prayerRemovalRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.prayerAction.deleteMany();
  await prisma.prayer.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  // Não deletamos Users para preservar sessões OAuth já existentes
  console.log("   ✓ Dados limpos\n");

  // ── 2. Usuários ─────────────────────────────────────────────────────────────
  console.log("👤 Criando usuários...");

  const adminPassword = await hashPassword("Admin@123");
  const userPassword = await hashPassword("Senha@123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@mural.dev" },
    update: {
      name: "Administrador",
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
    create: {
      email: "admin@mural.dev",
      name: "Administrador",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  const maria = await prisma.user.upsert({
    where: { email: "maria@mural.dev" },
    update: { name: "Maria Oliveira" },
    create: {
      email: "maria@mural.dev",
      name: "Maria Oliveira",
      password: userPassword,
      emailVerified: new Date(),
      createdAt: daysAgo(30),
    },
  });

  const joao = await prisma.user.upsert({
    where: { email: "joao@mural.dev" },
    update: { name: "João Silva" },
    create: {
      email: "joao@mural.dev",
      name: "João Silva",
      password: userPassword,
      emailVerified: new Date(),
      createdAt: daysAgo(25),
    },
  });

  const ana = await prisma.user.upsert({
    where: { email: "ana@mural.dev" },
    update: { name: "Ana Costa" },
    create: {
      email: "ana@mural.dev",
      name: "Ana Costa",
      password: userPassword,
      emailVerified: new Date(),
      createdAt: daysAgo(20),
    },
  });

  const pedro = await prisma.user.upsert({
    where: { email: "pedro@mural.dev" },
    update: { name: "Pedro Santos" },
    create: {
      email: "pedro@mural.dev",
      name: "Pedro Santos",
      password: userPassword,
      emailVerified: new Date(),
      createdAt: daysAgo(15),
    },
  });

  console.log(`   ✓ ${5} usuários criados/atualizados`);
  console.log(`     → admin@mural.dev   (senha: Admin@123, role: ADMIN)`);
  console.log(`     → maria@mural.dev   (senha: Senha@123)`);
  console.log(`     → joao@mural.dev    (senha: Senha@123)`);
  console.log(`     → ana@mural.dev     (senha: Senha@123)`);
  console.log(`     → pedro@mural.dev   (senha: Senha@123)\n`);

  // ── 3. Orações (todas as categorias e status) ────────────────────────────────
  console.log("🙏 Criando orações...");

  const prayers = await prisma.prayer.createManyAndReturn({
    data: [
      // HEALTH
      {
        title: "Cura completa da minha mãe",
        description:
          "Minha mãe foi diagnosticada com câncer no estágio inicial. Peço oração pela cura completa e pela paz da família durante o tratamento.",
        category: Category.HEALTH,
        status: PrayerStatus.ACTIVE,
        authorId: maria.id,
        verseReference: "Jeremias 30:17",
        createdAt: daysAgo(10),
      },
      {
        title: "Recuperação após cirurgia",
        description:
          "Passei por uma cirurgia na coluna e a recuperação está sendo lenta. Preciso de oração para acelerar a cura e ter forças para a fisioterapia.",
        category: Category.HEALTH,
        status: PrayerStatus.CHRONIC,
        authorId: joao.id,
        verseReference: "Salmos 103:3",
        createdAt: daysAgo(60),
      },
      {
        title: "Cura da depressão respondida!",
        description:
          "Após dois anos de luta contra a depressão severa, com muito tratamento e orações, estou bem. Deus é fiel!",
        category: Category.HEALTH,
        status: PrayerStatus.ANSWERED,
        authorId: ana.id,
        testimony:
          "Deus usou médicos, medicação e a intercessão de irmãos para me restaurar completamente. Gratidão a todos que oraram por mim.",
        createdAt: daysAgo(90),
      },

      // FAMILY
      {
        title: "Reconciliação com meu pai",
        description:
          "Há 5 anos não falo com meu pai por causa de uma briga séria. Quero pedir oração para Deus abrir portas de reconciliação e nos restaurar.",
        category: Category.FAMILY,
        status: PrayerStatus.ACTIVE,
        isAnonymous: true,
        authorId: pedro.id,
        createdAt: daysAgo(5),
      },
      {
        title: "Meu filho voltando para a fé",
        description:
          "Meu filho de 22 anos se afastou da igreja e está fazendo escolhas que me preocupam. Intercedo pelo retorno dele ao Senhor.",
        category: Category.FAMILY,
        status: PrayerStatus.CHRONIC,
        authorId: maria.id,
        verseReference: "Provérbios 22:6",
        createdAt: daysAgo(180),
      },

      // FINANCES
      {
        title: "Emprego urgente",
        description:
          "Estou desempregado há 4 meses com família para sustentar. Preciso de oração para encontrar trabalho que supra as necessidades da minha família.",
        category: Category.FINANCES,
        status: PrayerStatus.ACTIVE,
        authorId: joao.id,
        verseReference: "Filipenses 4:19",
        createdAt: daysAgo(7),
      },
      {
        title: "Quitação de dívidas",
        description:
          "Acumulei dívidas no período difícil e agora luto para quitar tudo. Peço sabedoria financeira e provisão de Deus.",
        category: Category.FINANCES,
        status: PrayerStatus.CHRONIC,
        authorId: pedro.id,
        createdAt: daysAgo(45),
      },

      // RELATIONSHIPS
      {
        title: "Deus no centro do meu casamento",
        description:
          "Meu casamento está passando por uma fase difícil. Peço oração para que a presença de Deus seja restaurada e que encontremos a cura para as feridas.",
        category: Category.RELATIONSHIPS,
        status: PrayerStatus.ACTIVE,
        isAnonymous: true,
        authorId: ana.id,
        createdAt: daysAgo(3),
      },

      // WORK_STUDY
      {
        title: "Aprovação no concurso público",
        description:
          "Estudo há 2 anos para um concurso importante. A prova é em 30 dias. Peço oração pelo foco, pela retenção do conteúdo e pela paz no dia da prova.",
        category: Category.WORK_STUDY,
        status: PrayerStatus.ACTIVE,
        authorId: maria.id,
        verseReference: "Provérbios 16:3",
        createdAt: daysAgo(2),
      },
      {
        title: "Passou na faculdade!",
        description:
          "Depois de 3 anos tentando, passei no vestibular para medicina! As orações foram fundamentais para eu não desistir.",
        category: Category.WORK_STUDY,
        status: PrayerStatus.ANSWERED,
        authorId: joao.id,
        testimony:
          "Na véspera da prova estava desanimado, mas senti a paz de Deus me cobrir. Acertei mais que nunca e passei em 1º lugar na ampla concorrência!",
        createdAt: daysAgo(120),
      },

      // HOLINESS
      {
        title: "Vitória sobre a pornografia",
        description:
          "Luto há anos com esse vício que destrói meu testemunho e minha vida espiritual. Preciso de oração e encorajamento de irmãos.",
        category: Category.HOLINESS,
        status: PrayerStatus.CHRONIC,
        isAnonymous: true,
        authorId: pedro.id,
        verseReference: "1 Coríntios 10:13",
        createdAt: daysAgo(30),
      },
      {
        title: "Aprofundamento na oração diária",
        description:
          "Sinto que minha vida de oração está fria e mecânica. Peço que irmãos intercedam para que eu tenha mais desejo genuíno de comunhão com Deus.",
        category: Category.HOLINESS,
        status: PrayerStatus.ACTIVE,
        authorId: ana.id,
        verseReference: "Mateus 6:6",
        createdAt: daysAgo(1),
      },
    ],
  });

  console.log(`   ✓ ${prayers.length} orações criadas\n`);

  // ── 4. Grupo de Oração ────────────────────────────────────────────────────────
  console.log("👥 Criando grupo de oração...");

  const group = await prisma.group.create({
    data: {
      name: "Intercessores Unidos",
      description:
        "Grupo dedicado à intercessão contínua pela família, saúde e avivamento espiritual na nossa comunidade.",
      status: GroupStatus.ACTIVE,
      leaderId: maria.id,
      createdAt: daysAgo(40),
    },
  });

  // Membros do grupo
  await prisma.groupMember.createMany({
    data: [
      {
        userId: maria.id,
        groupId: group.id,
        status: GroupMemberStatus.ACTIVE,
        joinedAt: daysAgo(40),
        createdAt: daysAgo(40),
      },
      {
        userId: joao.id,
        groupId: group.id,
        status: GroupMemberStatus.ACTIVE,
        joinedAt: daysAgo(35),
        createdAt: daysAgo(38),
      },
      {
        userId: ana.id,
        groupId: group.id,
        status: GroupMemberStatus.ACTIVE,
        joinedAt: daysAgo(30),
        createdAt: daysAgo(32),
      },
      {
        userId: pedro.id,
        groupId: group.id,
        status: GroupMemberStatus.PENDING,
        createdAt: daysAgo(2),
      },
    ],
  });

  // Oração exclusiva do grupo
  const groupPrayer = await prisma.prayer.create({
    data: {
      title: "Avivamento na nossa cidade",
      description:
        "Intercedemos juntos por um mover genuíno de Deus nas igrejas e nas ruas da nossa cidade. Que almas sejam salvas e vidas transformadas.",
      category: Category.HOLINESS,
      status: PrayerStatus.ACTIVE,
      authorId: maria.id,
      visibility: PrayerVisibility.GROUP_ONLY,
      groupId: group.id,
      verseReference: "2 Crônicas 7:14",
      createdAt: daysAgo(20),
    },
  });

  console.log(`   ✓ Grupo "${group.name}" criado com 4 membros`);
  console.log(`   ✓ 1 oração exclusiva do grupo criada\n`);

  // ── 5. Interações: PrayerActions (intercedendo por orações) ──────────────────
  console.log("❤️  Criando interações (intercessões e comentários)...");

  const publicPrayers = prayers.slice(0, 8); // primeiras 8 orações públicas

  // Cada usuário intercede por algumas orações (evitando interceder pela própria)
  const prayerActionData: { userId: string; prayerId: string }[] = [];

  for (const prayer of publicPrayers) {
    const intercessors = [admin, maria, joao, ana, pedro].filter(
      (u) => u.id !== prayer.authorId,
    );
    for (const user of intercessors.slice(0, 3)) {
      prayerActionData.push({ userId: user.id, prayerId: prayer.id });
    }
  }

  await prisma.prayerAction.createMany({ data: prayerActionData });

  // ── 6. Comentários ────────────────────────────────────────────────────────────
  const commentData = [
    {
      text: "Estou orando por você e pela sua mãe. Deus é o nosso médico por excelência!",
      authorId: joao.id,
      prayerId: prayers[0].id, // Cura da mãe
      createdAt: daysAgo(9),
    },
    {
      text: 'Intercedendo com fé. "Pelo ferimento dele fomos sarados" — Isaías 53:5',
      authorId: ana.id,
      prayerId: prayers[0].id,
      createdAt: daysAgo(8),
    },
    {
      text: "Deus te fortalece a cada dia. Não desanime!",
      authorId: maria.id,
      prayerId: prayers[1].id, // Recuperação cirurgia
      createdAt: daysAgo(55),
    },
    {
      text: "Que alegria ler esse testemunho! Glória a Deus pela sua restauração!",
      authorId: pedro.id,
      prayerId: prayers[2].id, // Cura depressão
      createdAt: daysAgo(88),
    },
    {
      text: "Orando pela reconciliação. Deus é o Deus do impossível.",
      authorId: joao.id,
      prayerId: prayers[3].id, // Reconciliação com pai
      createdAt: daysAgo(4),
    },
    {
      text: "Já orei pelo seu emprego. Acredite: a provisão de Deus vem em tempo!",
      authorId: ana.id,
      prayerId: prayers[5].id, // Emprego
      createdAt: daysAgo(6),
    },
    {
      text: "Parabéns! Esse testemunho me encorajou muito a continuar estudando.",
      authorId: maria.id,
      prayerId: prayers[9].id, // Passou na faculdade
      createdAt: daysAgo(118),
    },
    {
      text: "Intercedendo contigo. A oração do grupo tem muito poder!",
      authorId: joao.id,
      prayerId: groupPrayer.id,
      createdAt: daysAgo(18),
    },
  ];

  await prisma.comment.createMany({ data: commentData });

  console.log(`   ✓ ${prayerActionData.length} intercessões registradas`);
  console.log(`   ✓ ${commentData.length} comentários criados\n`);

  // ── 7. Report (denúncia de teste para moderação) ─────────────────────────────
  console.log("🚩 Criando report de moderação...");

  await prisma.report.create({
    data: {
      reason:
        "Conteúdo parece ser spam ou autopublicidade, não um pedido genuíno de oração.",
      reporterId: admin.id,
      prayerId: prayers[6].id,
      createdAt: daysAgo(1),
    },
  });

  console.log(`   ✓ 1 report criado\n`);

  // ── 8. Audit Logs ─────────────────────────────────────────────────────────────
  console.log("📋 Criando logs de auditoria...");

  await prisma.auditLog.createMany({
    data: [
      {
        action: AuditAction.GROUP_APPROVED,
        actorId: admin.id,
        targetId: group.id,
        createdAt: daysAgo(40),
      },
      {
        action: AuditAction.JOIN_REQUEST_SUBMITTED,
        actorId: pedro.id,
        targetId: group.id,
        createdAt: daysAgo(2),
      },
      {
        action: AuditAction.PRAYER_APPROVED,
        actorId: admin.id,
        targetId: prayers[0].id,
        createdAt: daysAgo(10),
      },
    ],
  });

  console.log(`   ✓ 3 logs de auditoria criados\n`);

  // ── Resumo Final ──────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════");
  console.log("✅ Seed concluído com sucesso!");
  console.log("═══════════════════════════════════════════════════");
  console.log("📊 Resumo:");
  console.log(`   • Usuários : 5 (1 admin + 4 regulares)`);
  console.log(
    `   • Orações  : ${prayers.length + 1} (${prayers.length} públicas + 1 exclusiva de grupo)`,
  );
  console.log(`   • Grupos   : 1 (com 4 membros)`);
  console.log(`   • Intercessões: ${prayerActionData.length}`);
  console.log(`   • Comentários : ${commentData.length}`);
  console.log(`   • Reports  : 1`);
  console.log(`   • Logs     : 3`);
  console.log("═══════════════════════════════════════════════════");
  console.log("\n🔑 Credenciais de acesso:");
  console.log("   admin@mural.dev  →  Admin@123  [ADMIN]");
  console.log("   maria@mural.dev  →  Senha@123");
  console.log("   joao@mural.dev   →  Senha@123");
  console.log("   ana@mural.dev    →  Senha@123");
  console.log("   pedro@mural.dev  →  Senha@123");
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
