"use client";

import { useState } from "react";
import { Check, Copy, Link2, MessageSquare } from "lucide-react";
import { brand } from "@/lib/brand";
import { useAppState } from "@/lib/store";
import { toast } from "@/lib/toast";
import { Modal } from "@/components/ui/Modal";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import { AvatarStack } from "@/components/ui/Avatar";
import { members } from "@/lib/selectors";

/** Shows a mock invite link. The link is a demo and does not create a shared session. */
export function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useAppState();
  const link = `https://${brand.inviteHost}/t/${s.trip.slug}`;
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast("Invite link copied");
    } catch {
      // Clipboard blocked: show the link selected so it can be copied by hand.
      setManual(true);
      toast("Select the link and copy it");
    }
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite your friends">
      <p className="text-ink-soft">Send this link to the group chat. Anyone who opens it sees the invitation and can join without an account.</p>
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-ink/15 bg-white p-2 pl-4">
        <Link2 className="size-5 shrink-0 text-ink-soft" aria-hidden />
        <input readOnly value={link} aria-label="Invite link" onFocus={(e) => e.currentTarget.select()} autoFocus={manual} className="min-w-0 flex-1 bg-transparent py-2 text-base font-semibold focus:outline-none" />
        <Button onClick={copy} size="sm">
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="mt-2 text-sm text-ink-soft">Demo link. It works only in this browser, so use the button below to see what friends see.</p>
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-paper-deep p-4">
        <div>
          <p className="font-bold">{members(s).length} people invited</p>
          <p className="text-sm text-ink-soft">Hosted by {s.users.find((u) => u.id === s.trip.hostId)?.name}</p>
        </div>
        <AvatarStack users={members(s)} max={5} />
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <ButtonLink href={ROUTES.invite} variant="dark" className="flex-1" onClick={onClose}>
          <MessageSquare className="size-4" aria-hidden />Preview what friends see
        </ButtonLink>
        <Button variant="ghost" onClick={onClose} className="flex-1">Done</Button>
      </div>
    </Modal>
  );
}
