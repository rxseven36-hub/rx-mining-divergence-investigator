"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { label: "TODAY", href: "/today" },
  { label: "COMPANIES", href: "/companies" },
  { label: "EXPLORE", href: "/explore" },
  { label: "INSIGHTS", href: "/insights" },
] as const;

export function ProductHeader() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="rxn-header">
      <Link href="/" className="rxn-brand" aria-label="RX MDI home">
        <div className="rxn-logo">
          <span>RX</span>
          <strong>MDI</strong>
        </div>

        <small>Mining intelligence</small>
      </Link>

      <nav className="rxn-nav" aria-label="Primary navigation">
        {navigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "is-active" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="rxn-header-actions">
        <Link href="/explore" className="rxn-global-search">
          <span className="rxn-search-icon" aria-hidden="true" />
          <span>Search company, ticker, or keyword...</span>
          <kbd>/</kbd>
        </Link>

        <span className="rxn-notification" aria-hidden="true">
          ●
        </span>

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            className="rxn-avatar"
            aria-label="Open RX MDI information menu"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((open) => !open)}
            style={{
              border: 0,
              padding: 0,
              cursor: "pointer",
              font: "inherit",
            }}
          >
            R
          </button>

          {profileOpen ? (
            <div
              role="menu"
              aria-label="RX MDI information"
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: 230,
                padding: 8,
                border: "1px solid rgba(78, 141, 166, .22)",
                borderRadius: 12,
                background: "rgba(5, 20, 30, .98)",
                boxShadow: "0 18px 42px rgba(0, 0, 0, .34)",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  padding: "9px 10px 8px",
                  borderBottom: "1px solid rgba(78, 141, 166, .12)",
                  marginBottom: 4,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    color: "#edf7fb",
                    fontSize: 15,
                    letterSpacing: ".02em",
                  }}
                >
                  RX MDI
                </strong>
                <span
                  style={{
                    display: "block",
                    marginTop: 3,
                    color: "#668391",
                    fontSize: 11,
                  }}
                >
                  Indonesian mining intelligence
                </span>
              </div>

              <Link
                href="/about"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
                style={menuItemStyle}
              >
                <span style={menuTitleStyle}>About RX MDI</span>
                <small style={menuTextStyle}>What the product is and why it exists</small>
              </Link>

              <Link
                href="/methodology"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
                style={menuItemStyle}
              >
                <span style={menuTitleStyle}>Sources & Methodology</span>
                <small style={menuTextStyle}>How data, evidence, and intelligence are handled</small>
              </Link>

              <Link
                href="/api/coverage"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
                style={menuItemStyle}
              >
                <span style={menuTitleStyle}>Data Coverage</span>
                <small style={menuTextStyle}>Current verified, partial, and unavailable coverage</small>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

const menuItemStyle = {
  display: "block",
  padding: "9px 10px",
  borderRadius: 8,
  textDecoration: "none",
} as const;

const menuTitleStyle = {
  display: "block",
  color: "#ddecf2",
  fontSize: 13,
  fontWeight: 800,
} as const;

const menuTextStyle = {
  display: "block",
  marginTop: 3,
  color: "#627f8c",
  fontSize: 10,
  lineHeight: 1.45,
} as const;
