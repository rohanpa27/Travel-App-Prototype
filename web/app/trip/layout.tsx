import { TripShell } from "@/components/layout/TripShell";

export default function TripLayout({ children }: { children: React.ReactNode }) {
  return <TripShell>{children}</TripShell>;
}
