import Link from "next/link";

const doors = [
  {
    number: "01",
    eyebrow: "RIGHT NOW",
    title: "Today",
    body: "See what is moving across Indonesian mining — companies, commodities, capital flow, and important events.",
    href: "/today",
    action: "OPEN MINING TODAY",
  },
  {
    number: "02",
    eyebrow: "UNDERSTAND",
    title: "Companies",
    body: "Go from company identity to mining operations, sales, financials, ownership, market activity, and recent events.",
    href: "/companies",
    action: "EXPLORE COMPANIES",
  },
  {
    number: "03",
    eyebrow: "DISCOVER",
    title: "Explore",
    body: "Move across companies, commodities, mines, regions, ownership groups, and connected mining information.",
    href: "/explore",
    action: "EXPLORE MINING",
  },
  {
    number: "04",
    eyebrow: "ASK NATURALLY",
    title: "Ask RX",
    body: "Ask questions in plain language and get answers grounded in the mining information RX MDI can verify.",
    href: "/ask",
    action: "ASK RX",
  },
] as const;

export function ProductDoors() {
  return (
    <section className="rxp-section rxp-product-section">
      <div className="rxp-section-heading">
        <div>
          <span>START ANYWHERE</span>
          <h2>What do you want to understand?</h2>
        </div>

        <p>
          RX MDI connects information instead of leaving you with
          disconnected numbers and pages.
        </p>
      </div>

      <div className="rxp-door-grid">
        {doors.map((door) => (
          <Link
            key={door.title}
            href={door.href}
            className="rxp-door"
          >
            <div className="rxp-door-top">
              <span>{door.number}</span>
              <small>{door.eyebrow}</small>
            </div>

            <h3>{door.title}</h3>
            <p>{door.body}</p>

            <strong>
              {door.action}
              <span aria-hidden="true">→</span>
            </strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
