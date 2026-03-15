interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({
  message = "Nenhum pedido encontrado.",
}: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <p className="text-gray-text text-base max-w-sm">{message}</p>
    </div>
  );
}
