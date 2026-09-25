"use client";

import Link from "next/link";

const items = [
  { label: "Today", short: "TD", href: "/today" },
  { label: "Companies", short: "CO", href: "/companies" },
  { label: "Explore", short: "EX", href: "/explore" },
  { label: "Insights", short: "IN", href: "/insights" },
];

export function MobileNav() {
  return <nav className="rxp-mobile-nav" aria-label="Mobile navigation">{items.map((item) => <Link key={item.href} href={item.href}><span>{item.short}</span><small>{item.label}</small></Link>)}</nav>;
}
