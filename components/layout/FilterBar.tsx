"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { label: "Tudo", value: "" },
  { label: "🙏 Em oração", value: "ACTIVE" },
  { label: "🔄 Crônico", value: "CHRONIC" },
  { label: "✅ Respondido", value: "ANSWERED" },
];

const CATEGORY_FILTERS = [
  { label: "🏥 Saúde", value: "HEALTH" },
  { label: "👨‍👩‍👧 Família", value: "FAMILY" },
  { label: "💰 Finanças", value: "FINANCES" },
  { label: "💍 Relacionamentos", value: "RELATIONSHIPS" },
  { label: "🎓 Estudos", value: "WORK_STUDY" },
  { label: "🙏 Santidade", value: "HOLINESS" },
];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = searchParams.get(key) ?? "";

    // Clicar no filtro ativo desmarca (toggle); clicar em outro aplica.
    if (value && value === current) {
      params.delete(key);
    } else if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="overflow-x-auto scrollbar-hide bg-card border-b border-gray-med">
      <div className="flex gap-2 px-4 py-2 min-w-max">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter("status", f.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap",
              (f.value === "" && !currentStatus) || currentStatus === f.value
                ? "bg-gold-warm text-white border-gold-warm"
                : "bg-card border-gray-med text-navy hover:border-gold-warm"
            )}
          >
            {f.label}
          </button>
        ))}
        <div className="w-px bg-gray-med mx-1 self-stretch" />
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter("category", f.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap",
              currentCategory === f.value
                ? "bg-gold-warm text-white border-gold-warm"
                : "bg-card border-gray-med text-navy hover:border-gold-warm"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
