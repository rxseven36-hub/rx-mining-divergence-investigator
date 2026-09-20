"use client";

import { useRouter } from "next/navigation";

export function InvestigatorBack() {
  const router = useRouter();

  return (
    <div className="rxmdi-investigator-mobile-back">
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push("/");
          }
        }}
        aria-label="Back"
      >
        Back
      </button>

      <style jsx>{`
        .rxmdi-investigator-mobile-back {
          display: none;
        }

        @media (max-width: 768px) {
          .rxmdi-investigator-mobile-back {
            display: block;
            padding: 12px 16px 0;
          }

          button {
            margin: 0 0 14px;
            padding: 0;
            border: 0;
            background: transparent;
            color: #8ecfe8;
            font: inherit;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          }
        }
      `}</style>
    </div>
  );
}
