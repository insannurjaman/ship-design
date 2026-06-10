"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1 border-b border-line p-3 lg:flex-1 lg:content-start lg:border-b-0" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveNavItem(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "min-h-11 border px-3 py-2 font-mono text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-green",
              isActive
                ? "border-accent-green/70 bg-accent-soft text-accent-green"
                : "border-transparent text-ink-secondary hover:border-line hover:bg-surface-raised hover:text-ink-primary"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function isActiveNavItem(pathname: string, href: string) {
  if (href === "/projects") {
    return pathname === "/projects" || (pathname.startsWith("/projects/") && pathname !== "/projects/new");
  }

  return pathname === href;
}
