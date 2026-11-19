"use client";

import { RotateCcw } from "lucide-react";
import { dispatch } from "@/lib/store";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";

/** Restores the seeded Chicago demo. Asks first because it discards local changes. */
export function ResetDemoButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}><RotateCcw className="size-4" aria-hidden />Reset demo</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Reset the demo?">
        <p>This clears everything you changed in this browser and brings back the original Chicago Birthday Weekend.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="danger" className="flex-1" onClick={() => { dispatch({ type: "reset" }); setOpen(false); toast("Demo reset to the original trip"); }}>Reset everything</Button>
          <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>Keep my changes</Button>
        </div>
      </Modal>
    </>
  );
}
