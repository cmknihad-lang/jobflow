'use client';
import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Max width class. Default 'max-w-md' */
  maxWidth?: string;
}

/**
 * Spring modal (Apple §3 — interruptible, §7 — spatial consistency).
 *
 * - Springs in from center with a gentle scale + fade (no slide from random direction).
 * - Backdrop click and Escape key both dismiss.
 * - Reduced-motion: plain opacity cross-fade, no scale.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: ModalProps) {
  const reduce = useReducedMotion();

  // Escape key dismissal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent background scroll while modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const panelVariants = reduce
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { opacity: 0, scale: 0.95, y: 8 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.97, y: 4 },
      };

  return (
    <AnimatePresence>
      {open && (
        // Backdrop
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onMouseDown={(e) => {
            // Dismiss only when clicking the backdrop itself, not the panel
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Panel */}
          <motion.div
            key="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={`relative bg-surface rounded-lg shadow-raised w-full ${maxWidth} overflow-hidden`}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={
              reduce
                ? { duration: 0.15 }
                : {
                    type: 'spring',
                    bounce: 0,      // critically damped
                    duration: 0.35,
                  }
            }
            // Stop backdrop click from propagating through the panel
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2
                id="modal-title"
                className="text-sm font-semibold text-text-primary"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="flex items-center justify-center h-7 w-7 rounded-sm text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
