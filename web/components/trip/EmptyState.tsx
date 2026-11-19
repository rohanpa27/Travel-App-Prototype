export function EmptyState({ icon, title, body, action }: { icon?: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-card border-2 border-dashed border-line bg-white/50 p-8 text-center">
      {icon && <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-sun-soft">{icon}</div>}
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-ink-soft">{body}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
