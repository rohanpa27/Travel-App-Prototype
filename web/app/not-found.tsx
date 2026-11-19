import { ButtonLink } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import { brand } from "@/lib/brand";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-2xl font-extrabold">{brand.name}</p>
      <h1 className="mt-6 text-5xl font-extrabold">That page isn&apos;t on the itinerary.</h1>
      <p className="mt-3 text-lg text-ink-soft">The link may be old, or the trip may have been reset.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={ROUTES.trip}>Go to your trip</ButtonLink>
        <ButtonLink href={ROUTES.home} variant="ghost">Back to the start</ButtonLink>
      </div>
    </main>
  );
}
