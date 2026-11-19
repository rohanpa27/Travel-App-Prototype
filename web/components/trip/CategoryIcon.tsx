import { Bed, Utensils, Wine, Trees, Landmark, Music2, Plane, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const icons: Record<string, typeof Bed> = { Stay: Bed, Food: Utensils, Drinks: Wine, Outdoors: Trees, Culture: Landmark, Nightlife: Music2, Transport: Plane, Other: Sparkles };

export function CategoryIcon({ category, size = "md" }: { category: string; size?: "md" | "lg" }) {
  const Icon = icons[category] ?? Sparkles;
  const color = CATEGORIES.find((c) => c.id === category)?.color ?? "#E7E1D4";
  return (
    <span className={`grid shrink-0 place-items-center rounded-2xl border-2 border-ink ${size === "lg" ? "size-16" : "size-12"}`} style={{ background: color }}>
      <Icon className={size === "lg" ? "size-8" : "size-6"} aria-hidden />
    </span>
  );
}
