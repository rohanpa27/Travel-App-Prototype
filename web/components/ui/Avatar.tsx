import type { User } from "@/lib/types";
import { asset } from "@/lib/paths";

const sizes = { xs: "size-6", sm: "size-8", md: "size-11", lg: "size-16", xl: "size-24" } as const;

/** Set `decorative` when the person's name is already shown next to the avatar, so screen readers do not read it twice. */
export function Avatar({ user, size = "md", ring = true, decorative = false }: { user: Pick<User, "name" | "avatarUrl">; size?: keyof typeof sizes; ring?: boolean; decorative?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(user.avatarUrl)} alt={decorative ? "" : user.name} title={decorative ? undefined : user.name} className={`${sizes[size]} shrink-0 rounded-full bg-paper-deep object-cover ${ring ? "ring-2 ring-paper" : ""}`} />
  );
}

/** Overlapping avatars with an optional "+N" overflow. */
export function AvatarStack({ users, max = 5, size = "sm", label }: { users: Pick<User, "id" | "name" | "avatarUrl">[]; max?: number; size?: keyof typeof sizes; label?: string }) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <div className="flex items-center" role="group" aria-label={label ?? users.map((u) => u.name).join(", ")}>
      <div className="flex -space-x-2.5">
        {shown.map((u) => (
          <Avatar key={u.id} user={u} size={size} />
        ))}
      </div>
      {extra > 0 && <span className="ml-1.5 text-sm font-semibold text-ink-soft">+{extra}</span>}
    </div>
  );
}
