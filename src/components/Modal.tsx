import React, { useCallback, useEffect, useId, useRef, useState, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, X, Info } from "lucide-react";

/***************************\
|*  MODAL (controlled)     *|
\***************************/

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Optional: prevent closing by overlay click or ESC */
  dismissible?: boolean;
  /** panel className to customize width, padding etc */
  className?: string;
  title?: string;
  /** Optional: render a close button in header */
  showClose?: boolean;
  children: React.ReactNode;
};

const useBodyScrollLock = (active: boolean) => {
  useEffect(() => {
    if (!active) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [active]);
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function trapFocus(container: HTMLElement) {
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));
  if (nodes.length === 0) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  function handleKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  container.addEventListener('keydown', handleKey);
  first.focus();
  return () => container.removeEventListener('keydown', handleKey);
}

export function Modal({ open, onClose, dismissible = true, className = "", title, showClose = true, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const labelId = useId();

  useEffect(() => setMounted(true), []);

  useBodyScrollLock(open);

  // ESC to close
  useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissible, onClose]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const cleanup = trapFocus(panelRef.current);
    return () => cleanup && cleanup();
  }, [open]);

  const onOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dismissible) return;
      if (e.target === e.currentTarget) onClose();
    },
    [dismissible, onClose]
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onOverlayClick}
          aria-hidden={!open}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? labelId : undefined}
            className={`relative mx-4 max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 ${className}`}
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            ref={panelRef}
          >
            {(title || showClose) && (
              <div className="flex items-center justify-between border-b px-5 py-3">
                <h2 id={labelId} className="text-base font-semibold text-gray-900">
                  {title}
                </h2>
                {showClose && (
                  <button
                    aria-label="Close"
                    onClick={onClose}
                    className="rounded-xl p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            <div className="px-5 py-4 overflow-y-auto" style={{ maxHeight: "calc(85vh - 52px)" }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}