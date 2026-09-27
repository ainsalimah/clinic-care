"use client";

import { useEffect, useRef } from "react";

export function useDialogAccessibility(onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("button, input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") return onClose();
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [onClose]);
  return dialogRef;
}
