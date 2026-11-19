import { CheckCircle2, Lightbulb, Hourglass, XCircle, CircleDollarSign } from "lucide-react";
import type { ActivityStatus, PaymentState } from "@/lib/types";

const status: Record<ActivityStatus, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  confirmed: { label: "Confirmed", cls: "bg-lime text-ink", Icon: CheckCircle2 },
  proposed: { label: "Proposed", cls: "bg-sun-soft text-ink", Icon: Hourglass },
  idea: { label: "Idea", cls: "bg-sky/60 text-ink", Icon: Lightbulb },
  cancelled: { label: "Cancelled", cls: "bg-coral-soft text-[#8a1c0c]", Icon: XCircle },
};

export function StatusBadge({ value }: { value: ActivityStatus }) {
  const { label, cls, Icon } = status[value];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold ${cls}`}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

const pay: Record<PaymentState, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-lime text-ink" },
  unpaid: { label: "Not paid", cls: "bg-coral-soft text-[#8a1c0c]" },
  tbd: { label: "Payment TBD", cls: "bg-paper-deep text-ink-soft" },
};

export function PaymentBadge({ value }: { value: PaymentState }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold ${pay[value].cls}`}>
      <CircleDollarSign className="size-3.5" aria-hidden />
      {pay[value].label}
    </span>
  );
}
