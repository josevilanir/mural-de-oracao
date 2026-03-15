"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { PrayerRequestColumn } from "@/components/ui/prayer-request-column";
import { mockPrayerRequests } from "@/lib/mock-prayer-requests";

const firstColumn = mockPrayerRequests.slice(0, 3);
const secondColumn = mockPrayerRequests.slice(3, 6);
const thirdColumn = mockPrayerRequests.slice(6, 9);

export default function PrayerRequestsSection() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-xs font-medium px-3 py-1 rounded-full border text-muted-foreground mb-4">
              Pedidos de Oração
            </span>
            <h2 className="font-display text-4xl font-bold text-foreground mt-3">
              A comunidade ora por você
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed"
          >
            Veja em tempo real os pedidos que a comunidade está levando em
            oração. Cada pedido é uma vida, uma história, uma fé acesa.
          </motion.p>
        </div>

        {/* Columns */}
        <div
          className="flex gap-6 justify-center max-h-[740px] overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
          }}
        >
          <PrayerRequestColumn requests={firstColumn} duration={15} />
          <PrayerRequestColumn
            requests={secondColumn}
            duration={19}
            className="hidden md:block"
          />
          <PrayerRequestColumn
            requests={thirdColumn}
            duration={17}
            className="hidden lg:block"
          />
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
        >
          <Link
            href="/register"
            className="px-8 py-4 bg-primary text-primary-foreground font-semibold text-base rounded-xl hover:opacity-90 transition-all shadow-md hover:-translate-y-0.5 text-center"
          >
            Criar conta gratuita
          </Link>
          <Link
            href="/mural"
            className="px-8 py-4 border border-border text-foreground font-semibold text-base rounded-xl hover:bg-muted transition-all hover:-translate-y-0.5 text-center"
          >
            Ver o mural →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
