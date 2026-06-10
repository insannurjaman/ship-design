import Link from "next/link";
import { APP_NAME, MARKETING_NAV_ITEMS } from "@/lib/constants";

type MarketingShellProps = {
  children: React.ReactNode;
};

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="min-h-screen bg-surface-base text-ink-primary">
      <header className="sticky top-0 z-20 border-b border-line bg-surface-base/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="font-mono text-sm uppercase text-accent-green">
            {APP_NAME}
          </Link>
          <nav className="flex items-center gap-2 font-mono text-xs text-ink-secondary sm:gap-4 sm:text-sm">
            {MARKETING_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="min-h-10 border border-transparent px-2 py-2 transition-colors hover:border-line hover:bg-surface-raised hover:text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-green sm:px-3"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
