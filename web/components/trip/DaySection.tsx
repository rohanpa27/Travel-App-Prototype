import type { Activity } from "@/lib/types";
import { sortActivities } from "@/lib/selectors";
import { ActivityCard } from "./ActivityCard";

export function DaySection({ title, subtitle, activities }: { title: string; subtitle?: string; activities: Activity[] }) {
  return (
    <section aria-labelledby={`day-${title}`} className="space-y-3">
      <div className="flex items-baseline gap-3">
        <h2 id={`day-${title}`} className="text-3xl font-extrabold">{title}</h2>
        {subtitle && <p className="text-ink-soft">{subtitle}</p>}
      </div>
      {activities.length === 0 ? (
        <p className="rounded-card border-2 border-dashed border-line px-5 py-6 text-center text-ink-soft">Nothing planned yet. Add something to fill the day.</p>
      ) : (
        sortActivities(activities).map((a) => <ActivityCard key={a.id} activity={a} />)
      )}
    </section>
  );
}
