import Link from "next/link";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import { MobileNav } from "@/components/rxmdi/MobileNav";

export default function MethodologyPage() {
  return (
    <main className="rxn-app">
      <ProductHeader />
      <section style={{ width: "min(920px, calc(100% - 32px))", margin: "0 auto", padding: "42px 0 80px" }}>
        <span style={{ color: "#45d8ff", fontSize: 10, fontWeight: 900, letterSpacing: ".14em" }}>SOURCES & METHODOLOGY</span>
        <h1 style={{ margin: "10px 0 0", color: "#f2f7fa", fontSize: 42, lineHeight: 1.05 }}>Evidence before explanation.</h1>
        <div style={{ display: "grid", gap: 12, marginTop: 24 }}>
          {[
            ["Source-aware", "RX MDI distinguishes collected, partial, and unavailable coverage instead of filling gaps with invented values."],
            ["Deterministic first", "Observable calculations and evidence are established before AI-generated explanation is considered."],
            ["Traceable investigation", "Divergence is treated as a signal to investigate, not automatic proof of causality."],
            ["Human-readable", "Technical evidence is surfaced through company context, comparisons, investigation, and provenance."],
          ].map(([title, text]) => (
            <article key={title} style={{ padding: 18, border: "1px solid rgba(70, 140, 166, .18)", borderRadius: 12, background: "rgba(7, 28, 40, .78)" }}>
              <strong style={{ color: "#e8f3f7", fontSize: 16 }}>{title}</strong>
              <p style={{ margin: "7px 0 0", color: "#7893a0", fontSize: 13, lineHeight: 1.65 }}>{text}</p>
            </article>
          ))}
        </div>
        <section id="data-source" style={{ marginTop: 32, paddingTop: 8 }}>
          <span style={{ color: "#45d8ff", fontSize: 10, fontWeight: 900, letterSpacing: ".14em" }}>DATA SOURCE</span>
          <h2 style={{ margin: "8px 0 0", color: "#e8f3f7", fontSize: 24 }}>Traceable source coverage.</h2>
          <p style={{ margin: "10px 0 0", color: "#7893a0", fontSize: 13, lineHeight: 1.65 }}>RX MDI uses source-backed mining, company, market, and operational evidence. Coverage can vary by company, period, and dataset, so unavailable or partial evidence is kept explicit instead of being filled with invented values.</p>
          <Link href="/api/coverage" style={{ display: "inline-block", marginTop: 14, color: "#42cfff", fontSize: 12, textDecoration: "none" }}>Open Data Coverage</Link>
        </section>

        <section id="disclaimer" style={{ marginTop: 32, paddingTop: 8 }}>
          <span style={{ color: "#45d8ff", fontSize: 10, fontWeight: 900, letterSpacing: ".14em" }}>DISCLAIMER</span>
          <h2 style={{ margin: "8px 0 0", color: "#e8f3f7", fontSize: 24 }}>Evidence is not causality.</h2>
          <p style={{ margin: "10px 0 0", color: "#7893a0", fontSize: 13, lineHeight: 1.65 }}>RX MDI presents observed evidence, deterministic analysis, and traceable context for investigation. A divergence, relationship, or market movement should not be treated as proof of causality unless the supporting evidence establishes it. RX MDI is an intelligence and research tool, not investment advice.</p>
        </section>
      </section>
      <MobileNav />
    </main>
  );
}
