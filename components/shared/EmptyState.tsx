interface EmptyStateProps {
  message?: string;
  emoji?: string;
}

export default function EmptyState({
  message = "Nenhum pedido encontrado.",
  emoji = "🙏",
}: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{emoji}</span>
      <p className="text-gray-text text-base max-w-sm">{message}</p>
    </div>
  );
}
