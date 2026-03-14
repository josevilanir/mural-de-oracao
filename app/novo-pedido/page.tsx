import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import NewPrayerForm from "@/components/prayers/NewPrayerForm";

export default async function NovoPedidoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-navy mb-2">
          Criar Novo Pedido de Oração
        </h1>
        <p className="text-sm text-gray-text italic mb-6">
          A comunidade está aqui para orar por você 🙏
        </p>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <NewPrayerForm />
        </div>
      </main>
    </>
  );
}
