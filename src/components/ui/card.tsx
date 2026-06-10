import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  interactive?: boolean;
};

type CardSectionProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, interactive = false, className, ...props }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-sm border border-line bg-surface-panel shadow-panel",
        interactive && "transition-colors hover:border-line-strong hover:bg-surface-hover",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ children, className, ...props }: CardSectionProps) {
  return (
    <div className={cn("border-b border-line px-5 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }: CardSectionProps) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: CardSectionProps) {
  return (
    <div className={cn("border-t border-line px-5 py-4", className)} {...props}>
      {children}
    </div>
  );
}
