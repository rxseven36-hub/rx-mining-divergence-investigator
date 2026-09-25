# RX Mining Divergence Investigator

> **From mining data to investigable intelligence.**

RX Mining Divergence Investigator (RX MDI) is an evidence-first market-intelligence system for investigating Indonesian mining-company signals. It turns fragmented company, operational, historical, market, and news context into structured, traceable intelligence while preserving the boundary between observation, inference, and evidence.

Built for **Sectors Hackathon 2026 - Track 03: Market Intelligence**.

---

## The Problem

Mining data can show that something changed without explaining why it changed.

Production and sales can diverge. Operational relationships can shift over time. Market activity, commodity context, licenses, mining sites, resources and reserves, or news events may appear relevant.

RX MDI is designed around one discipline:

**A divergence is an investigation signal - not automatic proof of a cause.**

The system helps analysts move from a visible signal to company context, operational divergence, investigation, and evidence without manufacturing certainty where the available evidence does not support it.

---

## Core Workflow

```text
TODAY
  v
SIGNAL
  v
COMPANY INTELLIGENCE
  v
DIVERGENCE
  v
INVESTIGATION
  v
EVIDENCE
```

### TODAY

Surfaces material changes and investigation-worthy signals so the user can start from what deserves attention.

### SIGNAL

Turns an observed change into a clear investigation entry point rather than presenting it as a conclusion.

### COMPANY INTELLIGENCE

Connects the signal to company-level context, including available financial, operational, mining, market, and related intelligence.

### DIVERGENCE

Visual Intelligence helps expose relationships that deserve investigation, including historical production-versus-sales behavior.

### INVESTIGATION

RX MDI structures the investigation path and keeps reasoning bounded by available evidence.

### EVIDENCE

Source-backed facts, deterministic computations, provenance, and limitations remain inspectable so a finding can be traced back to its basis.

---

## Visual Intelligence

RX MDI includes historical Production vs Sales Visual Intelligence for five Indonesian mining companies:

- **BUMI** - PT Bumi Resources Tbk
- **ADMR** - PT Alamtri Minerals Indonesia Tbk
- **BYAN** - PT Bayan Resources Tbk
- **ITMG** - PT Indo Tambangraya Megah Tbk
- **GEMS** - PT Golden Energy Mines Tbk

The historical view covers **2020-2024** where source data is available.

RX MDI does not interpolate or invent missing values. If two values are not comparable or a required value is unavailable, the interface preserves that limitation instead of manufacturing a gap.

The FY2024 company snapshot remains distinct from the historical trend and is reconciled with the historical evidence boundary.

---

## Investigation Discipline

RX MDI separates different kinds of information instead of presenting everything as equally proven.

- **Source-backed fact** - information admitted from an identified source.
- **Computed observation** - a deterministic relationship derived from admitted values.
- **Investigation signal** - something worth examining further.
- **Context** - information that can strengthen understanding without proving causality.
- **Unknown / unsupported** - a conclusion the available evidence does not establish.

A production-sales divergence can therefore be important without being labeled as proof of a specific operational cause.

---

## News & Event Evidence Boundary

News and events can strengthen investigation context, but RX MDI does not automatically treat them as causal evidence.

The product explicitly preserves this boundary:

> **Context-only intelligence**

News or event information may help an analyst understand what was happening around a company or period. It becomes causal support only when an admissible investigation path establishes that relationship.

**RX will not fake support.**

Unsupported questions remain unsupported.

---

## Why Sectors Is Core

Sectors is a core data source for RX MDI.

The system uses Sectors-backed information across the intelligence workflow, including available company and mining context such as:

- company information
- mining sites and licenses
- production and sales
- overburden and strip ratio
- products and commodity context
- resources and reserves
- market-series context
- news and event context

Source availability differs by company and metric. RX MDI preserves those differences instead of filling missing fields with fabricated values.

Sectors-derived evidence passes through RX MDI's validation, normalization, presentation, and evidence boundaries before it is used as investigation context.

---

## Company Coverage

The final hackathon workflow includes focused operational intelligence for:

| Company | Ticker |
| --- | --- |
| PT Bumi Resources Tbk | BUMI |
| PT Alamtri Minerals Indonesia Tbk | ADMR |
| PT Bayan Resources Tbk | BYAN |
| PT Indo Tambangraya Megah Tbk | ITMG |
| PT Golden Energy Mines Tbk | GEMS |

Additional company records may exist in the repository as valid development, market, evidence, or test coverage. They should not be interpreted as the current featured judging workflow.

---

## Evidence & Provenance

RX MDI is designed so that useful intelligence does not require hiding uncertainty.

The evidence layer preserves source context and provenance, while deterministic processing keeps observations reproducible.

Key principles:

1. **Observation is not explanation.**
2. **Divergence is not automatic causality.**
3. **Missing data stays missing.**
4. **Context-only evidence stays context-only.**
5. **Unsupported certainty is rejected.**
6. **Source provenance remains inspectable.**

---

## Intended Users

RX MDI is designed for people who need to investigate mining-company information rather than simply consume isolated data points, including:

- analysts
- researchers
- market participants

RX MDI is an information and research tool. It is not an automated trading system and does not provide investment recommendations.

---

## Technology

The repository includes a Next.js / React / TypeScript application with deterministic intelligence processing, Sectors integration, evidence handling, and automated regression coverage.

Core development and quality tooling includes:

- Next.js
- React
- TypeScript
- Sectors integration
- Zod
- Vitest
- ESLint

Credentials are intended to remain server-side. Local environment secrets must not be committed to the repository.

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

Configure the required values documented by the example environment file.

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
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Final pre-submission validation:

- **ESLint:** PASS
- **TypeScript:** PASS
- **Test files:** 156 passed, 2 skipped
- **Tests:** 948 passed, 7 skipped
- **Production build:** PASS
- **Static pages:** 34/34 generated

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

The system is designed to surface signals, connect company and operational context, expose divergences, support investigation, preserve evidence, and communicate limitations.

---

## Hackathon Status

**Submission-ready build.**

The product build is frozen for submission. Final work is limited to submission documentation, media, and submission preparation unless a genuine submission-blocking regression is discovered.

The judging story follows:

**TODAY -> SIGNAL -> COMPANY INTELLIGENCE -> DIVERGENCE -> INVESTIGATION -> EVIDENCE**

---

## Repository

Public repository:

`https://github.com/rxseven36-hub/rx-mining-divergence-investigator`

---

**RX MDI - From mining data to investigable intelligence.**
