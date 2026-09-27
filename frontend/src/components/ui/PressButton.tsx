'use client';
import { useReducedMotion, motion } from 'motion/react';
import type { ComponentPropsWithoutRef } from 'react';

type PressButtonProps = ComponentPropsWithoutRef<'button'> & {
  /** Extra scale on press. Default 0.96 */
  pressScale?: number;
};

/**
 * A button that gives instant pointer-down feedback (Apple §1).
 * Responds on press, not on release — so it never feels dead.
 * Scale springs back with a critically-damped spring (no overshoot).
 */
export default function PressButton({
  children,
  pressScale = 0.96,
  className = '',
  disabled,
  ...props
}: PressButtonProps) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      {...props}
      disabled={disabled}
      className={className}
      whileTap={reduce || disabled ? undefined : { scale: pressScale }}
      transition={{
        type: 'spring',
        bounce: 0,       // critically damped — no overshoot
        duration: 0.25,
      }}
    >
      {children}
    </motion.button>
  );
}
