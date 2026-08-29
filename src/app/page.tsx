export default function Home() {
  return (
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          RXseven
        </p>

        <h1 className="mt-4 text-4xl font-semibold">
          RX Mining Divergence Investigator
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          Evidence-first AI investigation engine for material mining
          divergences.
        </p>

        <div className="mt-10 rounded-xl border border-zinc-800 p-6">
          <p className="text-sm text-zinc-500">Product DNA</p>

          <p className="mt-2 text-xl font-medium">
            DETECT → PRIORITIZE → INVESTIGATE → EVIDENCE
          </p>
        </div>
      </div>
    </main>
  );
}
