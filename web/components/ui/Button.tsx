import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "dark" | "ghost" | "danger" | "soft";
type Size = "md" | "lg" | "sm";

const base = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 select-none";
const variants: Record<Variant, string> = {
  primary: "bg-brand text-white shadow-[0_10px_22px_-10px_rgba(91,91,240,0.75)] hover:bg-brand-deep",
  dark: "bg-ink text-paper hover:bg-ink/85",
  ghost: "border-2 border-ink/15 bg-transparent text-ink hover:border-ink/40 hover:bg-white",
  soft: "bg-white text-ink border border-line hover:bg-paper-deep",
  danger: "bg-coral-soft text-[#8a1c0c] hover:bg-coral/30",
};
const sizes: Record<Size, string> = { sm: "min-h-9 px-3.5 text-sm", md: "min-h-11 px-5 text-base", lg: "min-h-14 px-7 text-lg" };

type Common = { variant?: Variant; size?: Size; className?: string };

export function Button({ variant = "primary", size = "md", className = "", ...props }: Common & ComponentProps<"button">) {
  return <button type="button" className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}

export function ButtonLink({ variant = "primary", size = "md", className = "", ...props }: Common & ComponentProps<typeof Link>) {
  return <Link className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}
