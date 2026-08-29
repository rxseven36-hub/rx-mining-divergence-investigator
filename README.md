# RX Mining Divergence Investigator

Evidence-first AI investigation engine for material mining divergences.

Built for Sectors Hackathon 2026.

## Product DNA

DETECT → PRIORITIZE → INVESTIGATE → EVIDENCE

## Core Principle

RX does not treat every difference as an anomaly.

A detector is allowed to run only when the evidence is semantically,
dimensionally, and temporally comparable.

If comparability fails, RX skips the detector rather than inventing
an explanation.

## Truth Boundary

Every important output is classified as:

- SOURCE FACT
- COMPUTED FACT
- INFERENCE
- UNKNOWN

## Architecture

Sectors REST v2
→ SectorsAdapter
→ Normalization Layer
→ Comparability Guard
→ Detector Engine
→ Materiality / Priority Engine
→ Investigation Queue
→ AI Investigation Agent
→ Evidence Brief
→ UI

## Technical Direction

- Next.js
- TypeScript
- React
- Tailwind CSS
- Sectors REST API v2
- REST-FIRST, MCP-READY
- SQLite
- Prisma
- Zod
- Vitest
- Custom AI agent orchestration

## Security

Secrets must never be committed.

Local credentials belong in `.env.local`.

Public repository:

https://github.com/rxseven36-hub/rx-mining-divergence-investigator

## Status

Hackathon MVP development in progress.
