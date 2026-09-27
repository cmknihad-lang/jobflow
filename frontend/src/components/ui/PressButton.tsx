'use client';
import { useReducedMotion, motion } from 'motion/react';

interface PressButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  pressScale?: number;
}

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
  type = 'button',
  ...props
}: PressButtonProps) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={className}
      whileTap={reduce || disabled ? undefined : { scale: pressScale }}
      transition={{
        type: 'spring',
        bounce: 0,
        duration: 0.25,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
