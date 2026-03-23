import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PrayerRequestsSection from "@/components/prayers/PrayerRequestsSection";

export const metadata = {
  title: "Bem-vindo — Mural de Oração",
  description:
    "Compartilhe seus pedidos de oração com uma comunidade que intercede, acompanha e celebra cada resposta de Deus.",
};

export default async function WelcomePage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="min-h-screen bg-navy text-cream overflow-x-hidden">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-navy/80 backdrop-blur-md border-b border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-bold text-cream hover:text-gold-warm transition-colors"
        >
          <span>Mural de Oração</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-cream/80 hover:text-cream rounded-md hover:bg-white/10 transition-all"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-semibold bg-gold-warm text-white rounded-lg hover:bg-gold-warm/90 transition-all shadow-md hover:shadow-lg"
          >
            Criar Conta
          </Link>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Deep background */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-[#0d2240] to-[#080f1e]" />

        {/* Atmospheric glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gold-warm/10 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute top-32 left-1/4 w-[320px] h-[320px] bg-blue-main/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-24 right-1/4 w-[280px] h-[280px] bg-gold-warm/15 rounded-full blur-[90px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-blue-main/10 rounded-full blur-[120px]" />
        </div>

        {/* Decorative watermark cross */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
          <svg width="700" height="700" viewBox="0 0 700 700" fill="none">
            <rect
              x="295"
              y="60"
              width="110"
              height="580"
              rx="12"
              fill="white"
            />
            <rect
              x="60"
              y="230"
              width="580"
              height="110"
              rx="12"
              fill="white"
            />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-28 pb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-warm/20 border border-gold-warm/40 text-gold-warm text-sm font-medium mb-8">
            Comunidade de Intercessão
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-cream leading-[1.1] mb-6">
            Ninguém precisa
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-warm via-yellow-300 to-gold-warm">
              orar sozinho
            </span>
          </h1>

          <p className="text-lg md:text-xl text-cream/65 max-w-2xl mx-auto mb-10 leading-relaxed">
            Compartilhe seus pedidos com uma comunidade que intercede, acompanha
            e celebra junto com você cada resposta de Deus.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-gold-warm text-white font-semibold text-lg rounded-xl hover:bg-gold-warm/90 transition-all shadow-lg hover:shadow-gold-warm/25 hover:-translate-y-0.5"
            >
              Começar Agora — É Gratuito
            </Link>
            <Link
              href="/"
              className="px-8 py-4 border border-white/20 text-cream font-semibold text-lg rounded-xl hover:bg-white/10 transition-all hover:-translate-y-0.5"
            >
              Ver o Mural →
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-gold-warm">
                500+
              </div>
              <div className="text-xs text-cream/50 mt-1">Pedidos ativos</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="font-display text-3xl font-bold text-gold-warm">
                1.2k
              </div>
              <div className="text-xs text-cream/50 mt-1">Intercessores</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-gold-warm">
                180
              </div>
              <div className="text-xs text-cream/50 mt-1">Respondidos</div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-cream/30 animate-bounce">
          <span className="text-xs tracking-wide">rolar para baixo</span>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </section>

      {/* ── Prayer Requests Scroll ─────────────────────────── */}
      <PrayerRequestsSection />

      {/* ── How it works ───────────────────────────────────── */}
      <section className="py-24 px-6 bg-cream text-navy">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-gold-warm font-semibold text-sm uppercase tracking-widest">
              Como Funciona
            </span>
            <h2 className="font-display text-4xl font-bold text-navy mt-3">
              Simples como uma oração
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                icon: "✦",
                title: "Compartilhe seu pedido",
                desc: "Escreva o que está no seu coração. Você pode compartilhar com seu nome ou de forma anônima — sem julgamentos.",
              },
              {
                num: "02",
                icon: "✦",
                title: "A comunidade intercede",
                desc: 'Pessoas reais oram por você. Cada toque em "Estou orando" é uma oração real subindo aos céus.',
              },
              {
                num: "03",
                icon: "✦",
                title: "Celebre as respostas",
                desc: "Quando Deus responder, marque como respondido e compartilhe o testemunho para encorajar outros.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="relative p-8 rounded-2xl bg-white border border-gray-med shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="absolute -top-4 left-8 bg-gold-warm text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {step.num}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-display text-xl font-bold text-navy mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-text leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-b from-navy to-[#080f1e] text-cream">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-gold-warm font-semibold text-sm uppercase tracking-widest">
              Testemunhos
            </span>
            <h2 className="font-display text-4xl font-bold text-cream mt-3">
              Deus está respondendo
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                text: "Pedi oração pela saúde da minha mãe. Em dois meses ela estava curada e o médico não entendeu o que aconteceu.",
                category: "Saúde",
              },
              {
                text: "Estava desempregado há 8 meses. A comunidade orou comigo e em 3 semanas recebi a proposta que mudou minha vida.",
                category: "Trabalho",
              },
              {
                text: "Meu casamento estava se desfazendo. As orações daqui sustentaram nossa família. Hoje celebramos nosso reencontro.",
                category: "Família",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/8 transition-colors"
              >
                <div className="text-gold-warm text-4xl font-display leading-none mb-4">
                  &quot;
                </div>
                <p className="text-cream/75 leading-relaxed mb-6 italic">
                  {t.text}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-cream/40 text-sm">Usuário anônimo</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-status-green/20 text-status-green border border-status-green/30">
                    ✓ Respondido · {t.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gold-warm text-white text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6 text-white/60 font-display font-bold">
            ✦
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">
            Junte-se à comunidade
          </h2>
          <p className="text-white/80 text-lg mb-10 leading-relaxed">
            Mais de mil intercessores aguardam para orar com você.
            <br />
            Crie sua conta em menos de 1 minuto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-gold-warm font-bold text-lg rounded-xl hover:bg-cream transition-all shadow-lg hover:-translate-y-0.5"
            >
              Criar Conta Gratuita
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-xl hover:bg-white/15 transition-all hover:-translate-y-0.5"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="py-8 px-6 bg-[#080f1e] text-cream/30 text-center text-sm">
        <p>© 2026 Mural de Oração — Feito com fé e código.</p>
      </footer>
    </div>
  );
}
