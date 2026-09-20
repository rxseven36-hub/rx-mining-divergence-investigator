import Link from "next/link";

const examples = [
  { label: "BUMI", href: "/companies/BUMI" },
  { label: "Nickel", href: "/explore?commodity=nickel" },
  { label: "BUMI vs BYAN", href: "/compare?companies=BUMI,BYAN" },
  { label: "Who owns ADMR?", href: "/ask?q=Who%20owns%20ADMR%3F" },
] as const;

export function UniversalSearch() {
  return (
    <div className="rxp-search-wrap">
      <form className="rxp-search" action="/ask">
        <span className="rxp-search-icon" aria-hidden="true" />

        <input
          type="search"
          name="q"
          aria-label="Search RX MDI"
          placeholder="Search company, commodity, mine, or ask a question..."
        />

        <button type="submit" aria-label="Search">
          <span>SEARCH</span>
          <b aria-hidden="true">→</b>
        </button>
      </form>

      <div className="rxp-search-examples">
        <span>TRY</span>

        {examples.map((example) => (
          <Link key={example.label} href={example.href}>
            {example.label}
          </Link>
        ))}
      </div>
    </div>
  );
}


