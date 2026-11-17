"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { deleteAccount } from "@/app/actions/account";

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  return (
    <>
      <button onClick={() => setOpen(true)} className="mt-3 flex min-h-[48px] w-full items-center gap-3 rounded-2xl border border-danger/30 bg-surface px-4 font-medium text-danger">
        <Trash2 className="size-4" /> Delete my account
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Delete your account?">
        <p className="text-sm text-ink-2">
          This permanently deletes your profile, photos, answers, bonds and messages. It can't be undone. People you've bonded with will see the bond as ended.
        </p>
        <label className="mt-4 block text-sm font-semibold text-ink">
          Type DELETE to confirm
          <input className={`${inputCls} mt-1.5`} value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
        </label>
        <Button
          variant="danger"
          block
          size="lg"
          className="mt-4"
          disabled={text.trim().toUpperCase() !== "DELETE"}
          loading={pending}
          onClick={() =>
            start(async () => {
              const res = await deleteAccount(text);
              if (res && !res.ok) toast.error(res.error);
            })
          }
        >
          Permanently delete
        </Button>
      </Sheet>
    </>
  );
}
