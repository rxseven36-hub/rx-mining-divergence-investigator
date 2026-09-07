# RX Mining Divergence Investigator

> **Find the signal. Challenge the explanation.**

RX Mining Divergence Investigator (RX MDI) is an evidence-first market intelligence system that detects material inconsistencies in mining-company data, investigates them using Sectors evidence, challenges AI-generated explanations, and produces an evidence-bounded intelligence brief.

Built for **Sectors Hackathon 2026 — Track 3: Market Intelligence**.

---

## The Problem

A difference in company data can be important without explaining itself.

Production may diverge from sales. Historical performance may shift. Operational, commodity, or market context may appear relevant.

But:

**a divergence is not automatically an anomaly, and an explanation is not automatically true.**

RX MDI is designed to investigate that gap without turning incomplete evidence into confident AI narratives.

---

## How RX MDI Works

```text
DETECT
  ↓
PRIORITIZE
  ↓
INVESTIGATE
  ↓
EVIDENCE
  ↓
HYPOTHESIS
  ↓
CHALLENGE
  ↓
BRIEF
```

RX MDI:

1. Detects a material divergence from comparable data.
2. Determines whether the signal deserves investigation.
3. Builds a structured investigation plan.
4. Retrieves relevant evidence through Sectors.
5. Admits validated evidence into the reasoning context.
6. Lets AI propose an evidence-bounded hypothesis.
7. Challenges that hypothesis against the admitted evidence.
8. Produces an intelligence brief while preserving uncertainty.

---

## AI PROPOSES. RX PROVES.

AI is not the source of truth in RX MDI.

Sectors data and deterministic RX computations establish the evidence boundary first.

AI is used to interpret that evidence and propose possible explanations. RX then challenges those explanations before they can become part of the final intelligence brief.

Unsupported certainty is not treated as intelligence.

When the available evidence does not establish causality:

**CAUSAL CONCLUSION: UNKNOWN**

---

## Featured Demo Case

### PT Adaro Andalan Indonesia Tbk — AADI.JK — FY2024

The featured demo investigates a real production-sales divergence using Sectors data:

| Metric | FY2024 |
| --- | ---: |
| Production | 48.11 Mt |
| Sales | 55.80 Mt |
| Observed gap | +7.69 Mt |

RX MDI does **not** treat the 7.69 Mt difference as proof of a particular cause.

It launches an investigation.

The live workflow gathers relevant company, operational, historical, commodity, and market evidence through Sectors before allowing AI reasoning to begin.

In the validated demo run, RX MDI admitted **25 evidence items** into the investigation.

The AI proposed possible explanations.

RX challenged those explanations against the evidence.

The available evidence confirmed the divergence but did not establish a definitive cause.

Therefore the final causal conclusion remained:

**UNKNOWN**

AADI is a curated featured demo case. The investigation engine itself accepts company identity, Sectors slug, ticker, commodity, and year as runtime inputs.

---

## Why Sectors Is Core

Sectors is not a decorative data source or optional enrichment layer.

The production investigation workflow uses **Sectors REST API v2** to retrieve evidence including:

- mining company context
- mining historical performance
- commodity price history
- market transaction context

Sectors evidence passes through validation, normalization, investigation, and evidence-admission boundaries before it can participate in AI reasoning.

Without Sectors, the live evidence workflow cannot complete its core investigation.

---

## Evidence Discipline

RX MDI maintains an explicit truth boundary:

- **SOURCE FACT** — validated information originating from a source
- **COMPUTED FACT** — deterministically derived from admitted facts
- **INFERENCE** — interpretation that must remain evidence-bounded
- **UNKNOWN** — information or causality not established by available evidence

RX does not force a detector to run when evidence is not semantically, dimensionally, or temporally comparable.

It is better to preserve an unknown than manufacture an explanation.

---

## Architecture

```text
Sectors REST API v2
        ↓
Sectors Adapter
        ↓
Validation & Normalization
        ↓
Comparability Guard
        ↓
Signal Detection
        ↓
Materiality & Priority
        ↓
Investigation Plan
        ↓
Evidence Execution & Admission
        ↓
Neutral Evidence Pack
        ↓
AI Hypothesis
        ↓
RX Challenge
        ↓
Intelligence Brief
        ↓
Investigation Workspace
```

Deterministic operations remain in code.

AI is introduced only where interpretation adds value.

---

## Jury Experience

The workspace is built around the investigation story:

**Signal → Investigation → Evidence → AI Proposes ↔ RX Challenges → Intelligence Brief**

The primary result stays compact for fast review.

Detailed admitted evidence remains available through an expandable evidence view for traceability.

---

## Technology

- Next.js
- React
- TypeScript
- Sectors REST API v2
- Gemini through the RX LLM provider boundary
- Zod
- Vitest
- Prisma
- Tailwind CSS

Sectors and LLM credentials remain server-side and are never intentionally exposed to the browser.

---

## Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the environment

Copy:

```text
.env.example
```

to:

```text
.env.local
```

Then configure:

```text
SECTORS_API_KEY=
LLM_PROVIDER=
LLM_API_KEY=
```

Never commit `.env.local`.

### 3. Start RX MDI

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Quality Gates

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The current validated regression baseline contains **113 test files and 751 passing tests**.

---

## Scope & Safety

RX MDI is a market-intelligence and investigation system.

It does not provide:

- BUY recommendations
- SELL recommendations
- HOLD recommendations
- price targets
- investment recommendations
- automated trading

The system is designed to surface signals, investigate evidence, challenge explanations, and communicate uncertainty.

---

## Status

**Working end-to-end hackathon MVP.**

The featured AADI investigation has successfully completed the production workflow:

**Sectors → Signal → Investigation → Evidence → Hypothesis → Challenge → Intelligence Brief**

Current work is focused on jury documentation, demo preparation, and final submission readiness.

---

## Repository

Public repository:

`https://github.com/rxseven36-hub/rx-mining-divergence-investigator`

---

**RX MDI — Evidence before explanation.**
