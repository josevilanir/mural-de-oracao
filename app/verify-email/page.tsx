import { verifyEmailAction } from "@/app/actions/user/verify-email";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <Result ok={false} message="Link inválido." />;
  }

  const result = await verifyEmailAction(token);

  if (!result.success) {
    return <Result ok={false} message={result.error ?? "Link inválido ou expirado."} />;
  }

  return <Result ok={true} message="E-mail confirmado com sucesso!" />;
}

function Result({ ok, message }: { ok: boolean; message: string }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-sm p-8 w-full max-w-md text-center flex flex-col items-center gap-4">
        <span className="text-5xl">{ok ? "✅" : "❌"}</span>
        <p className={`text-sm font-medium ${ok ? "text-navy" : "text-red-500"}`}>{message}</p>
        <Link href={ok ? "/" : "/login"} className="text-blue-main hover:underline text-sm font-medium">
          {ok ? "Ir para o mural" : "Voltar ao login"}
        </Link>
      </div>
    </div>
  );
}
