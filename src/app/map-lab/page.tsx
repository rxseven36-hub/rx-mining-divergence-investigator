import { Suspense } from "react";
import { IndonesiaMiningMap } from "@/components/rxmdi/map/IndonesiaMiningMap";

export default function MapLabPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "#040a0f",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
        }}
      >
        <Suspense
          fallback={
            <div
              style={{
                minHeight: "70vh",
                display: "grid",
                placeItems: "center",
                color: "#7f9eaa",
              }}
            >
              Loading mining map...
            </div>
          }
        >
          <IndonesiaMiningMap />
        </Suspense>
      </div>
    </main>
  );
}
