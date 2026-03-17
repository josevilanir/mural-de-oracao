const API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL ?? "prayme356@gmail.com";
const FROM_NAME = process.env.BREVO_FROM_NAME ?? "Mural de Oração";
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

async function send(to: string, subject: string, html: string) {
  if (!API_KEY) {
    console.log("[email] BREVO_API_KEY não configurado — email não enviado:", subject, "→", to);
    return;
  }
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Brevo erro:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[email] Falha ao enviar:", err);
  }
}

// ─── Templates ────────────────────────────────────────────

function layout(content: string) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
      <div style="border-bottom:2px solid #c8912e;padding-bottom:16px;margin-bottom:24px;">
        <span style="font-size:1.2rem;font-weight:700;color:#0a1628;">🙏 Mural de Oração</span>
      </div>
      ${content}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;text-align:center;">
        Você está recebendo este e-mail porque tem uma conta no Mural de Oração.
      </div>
    </div>
  `;
}

function btn(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#c8912e;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">${label}</a>`;
}

// ─── Funções públicas ──────────────────────────────────────

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${BASE_URL}/reset-password?token=${token}`;
  await send(
    email,
    "Redefinição de senha — Mural de Oração",
    layout(`
      <h2 style="color:#0a1628;margin:0 0 12px;">Redefinir sua senha</h2>
      <p style="color:#555;line-height:1.6;">Recebemos uma solicitação para redefinir a senha da sua conta.</p>
      ${btn(url, "Redefinir senha")}
      <p style="color:#9ca3af;font-size:13px;">Este link expira em <strong>1 hora</strong>. Se não foi você, ignore este e-mail.</p>
    `)
  );
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const url = `${BASE_URL}/verify-email?token=${token}`;
  await send(
    email,
    "Confirme seu e-mail — Mural de Oração",
    layout(`
      <h2 style="color:#0a1628;margin:0 0 12px;">Bem-vindo, ${name}!</h2>
      <p style="color:#555;line-height:1.6;">Clique no botão abaixo para confirmar seu e-mail e começar a usar o Mural de Oração.</p>
      ${btn(url, "Confirmar e-mail")}
      <p style="color:#9ca3af;font-size:13px;">Este link expira em <strong>24 horas</strong>.</p>
    `)
  );
}

export async function sendCommentNotificationEmail(
  to: string,
  authorName: string,
  commenterName: string,
  prayerTitle: string,
  prayerId: string
) {
  const url = `${BASE_URL}/pedido/${prayerId}`;
  await send(
    to,
    `${commenterName} comentou no seu pedido — Mural de Oração`,
    layout(`
      <h2 style="color:#0a1628;margin:0 0 12px;">Novo comentário de encorajamento</h2>
      <p style="color:#555;line-height:1.6;">
        Olá, <strong>${authorName}</strong>!<br/>
        <strong>${commenterName}</strong> deixou uma palavra de encorajamento no seu pedido
        <em>"${prayerTitle}"</em>.
      </p>
      ${btn(url, "Ver comentário")}
    `)
  );
}

export async function sendGroupStatusEmail(
  to: string,
  name: string,
  groupName: string,
  approved: boolean
) {
  const subject = approved
    ? `Grupo aprovado: ${groupName} — Mural de Oração`
    : `Solicitação de grupo não aprovada — Mural de Oração`;

  const body = approved
    ? `
      <h2 style="color:#0a1628;margin:0 0 12px;">Seu grupo foi aprovado! 🎉</h2>
      <p style="color:#555;line-height:1.6;">
        Olá, <strong>${name}</strong>! O grupo <strong>${groupName}</strong> foi aprovado
        e já está disponível na comunidade.
      </p>
      ${btn(`${BASE_URL}/grupos`, "Ver grupos")}
    `
    : `
      <h2 style="color:#0a1628;margin:0 0 12px;">Atualização sobre seu grupo</h2>
      <p style="color:#555;line-height:1.6;">
        Olá, <strong>${name}</strong>. Sua solicitação para criar o grupo
        <strong>${groupName}</strong> não foi aprovada desta vez.
        Entre em contato com um administrador para mais informações.
      </p>
    `;

  await send(to, subject, layout(body));
}

export async function sendJoinRequestStatusEmail(
  to: string,
  name: string,
  groupName: string,
  approved: boolean
) {
  const subject = approved
    ? `Você foi aceito em ${groupName} — Mural de Oração`
    : `Atualização sobre ${groupName} — Mural de Oração`;

  const body = approved
    ? `
      <h2 style="color:#0a1628;margin:0 0 12px;">Solicitação aprovada! 🙏</h2>
      <p style="color:#555;line-height:1.6;">
        Olá, <strong>${name}</strong>! Você foi aceito no grupo <strong>${groupName}</strong>.
        Agora pode ver e publicar pedidos do grupo.
      </p>
      ${btn(`${BASE_URL}/grupos`, "Acessar grupo")}
    `
    : `
      <h2 style="color:#0a1628;margin:0 0 12px;">Atualização sobre sua solicitação</h2>
      <p style="color:#555;line-height:1.6;">
        Olá, <strong>${name}</strong>. Sua solicitação para entrar no grupo
        <strong>${groupName}</strong> não foi aprovada desta vez.
      </p>
    `;

  await send(to, subject, layout(body));
}
