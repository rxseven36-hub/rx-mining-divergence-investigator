import Link from "next/link";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import { MobileNav } from "@/components/rxmdi/MobileNav";

export default function AboutPage() {
  return (
    <main className="rxn-app">
      <ProductHeader />
      <section style={{ width: "min(920px, calc(100% - 32px))", margin: "0 auto", padding: "42px 0 80px" }}>
        <span style={{ color: "#45d8ff", fontSize: 10, fontWeight: 900, letterSpacing: ".14em" }}>ABOUT RX MDI</span>
        <h1 style={{ margin: "10px 0 0", color: "#f2f7fa", fontSize: 42, lineHeight: 1.05 }}>One place to understand Indonesian mining.</h1>
        <p style={{ maxWidth: 760, marginTop: 16, color: "#819ba8", fontSize: 14, lineHeight: 1.75 }}>
          RX MDI connects company context, market information, mining performance, verified developments,
          divergence signals, investigation, and evidence in one product.
        </p>
        <p style={{ maxWidth: 760, color: "#819ba8", fontSize: 14, lineHeight: 1.75 }}>
          The product is designed to stay simple first and go deep when needed. RX MDI does not invent
          unavailable company data and keeps its investigation layer separate from ordinary company information.
        </p>
        <Link href="/companies" style={{ display: "inline-block", marginTop: 18, color: "#42cfff", fontSize: 12, textDecoration: "none" }}>
          Explore Companies
        </Link>
      </section>
      <MobileNav />
    </main>
  );
}
