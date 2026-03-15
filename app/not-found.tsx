import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy mt-4 mb-2">
          Página não encontrada
        </h1>
        <p className="text-gray-text mb-6">
          O conteúdo que você procura não existe ou foi removido.
        </p>
        <Button asChild variant="primary">
          <Link href="/">Voltar ao Mural</Link>
        </Button>
      </div>
    </div>
  );
}
