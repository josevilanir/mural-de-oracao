"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { label: "Tudo", value: "" },
  { label: "Em oração", value: "ACTIVE" },
  { label: "Crônico", value: "CHRONIC" },
  { label: "Respondido", value: "ANSWERED" },
];

const CATEGORY_FILTERS = [
  { label: "Saúde", value: "HEALTH" },
  { label: "Família", value: "FAMILY" },
  { label: "Finanças", value: "FINANCES" },
  { label: "Relacionamentos", value: "RELATIONSHIPS" },
  { label: "Estudos", value: "WORK_STUDY" },
  { label: "Santidade", value: "HOLINESS" },
];

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap flex-shrink-0",
        active
          ? "bg-gold-warm text-white border-gold-warm"
          : "bg-card border-gray-med text-navy hover:border-gold-warm"
      )}
    >
      {label}
    </button>
  );
}

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  const pathname = usePathname();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = searchParams.get(key) ?? "";

    if (value && value === current) {
      params.delete(key);
    } else if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="bg-card border-b border-gray-med">
      {/* Mobile: two rows with gradient fade edges */}
      <div className="md:hidden">
        <div className="relative">
          <div className="flex overflow-x-auto scrollbar-hide gap-2 px-4 pt-2 pb-1">
            {STATUS_FILTERS.map((f) => (
              <FilterButton
                key={f.value}
                label={f.label}
                active={(f.value === "" && !currentStatus) || currentStatus === f.value}
                onClick={() => setFilter("status", f.value)}
              />
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        </div>
        <div className="relative">
          <div className="flex overflow-x-auto scrollbar-hide gap-2 px-4 pt-1 pb-2">
            {CATEGORY_FILTERS.map((f) => (
              <FilterButton
                key={f.value}
                label={f.label}
                active={currentCategory === f.value}
                onClick={() => setFilter("category", f.value)}
              />
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Desktop: single scrollable row */}
      <div className="hidden md:flex overflow-x-auto scrollbar-hide justify-center gap-2 px-4 py-2 min-w-max">
        {STATUS_FILTERS.map((f) => (
          <FilterButton
            key={f.value}
            label={f.label}
            active={(f.value === "" && !currentStatus) || currentStatus === f.value}
            onClick={() => setFilter("status", f.value)}
          />
        ))}
        <div className="w-px bg-gray-med mx-1 self-stretch" />
        {CATEGORY_FILTERS.map((f) => (
          <FilterButton
            key={f.value}
            label={f.label}
            active={currentCategory === f.value}
            onClick={() => setFilter("category", f.value)}
          />
        ))}
      </div>
    </div>
  );
}
