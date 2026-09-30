import type { FC } from "react";
import { ENVELOPE_SAND } from "./theme";

// Rows narrowing by % draw the flap at any width. A fixed-px border triangle made the email
// wider than a phone, so Gmail shrank the whole thing. `k-flap` is styled by the envelope's dark styles.
const FLAP_ROWS = 72;

export const Flap: FC = () => (
  <div style={{ fontSize: 0, lineHeight: 0 }}>
    {Array.from({ length: FLAP_ROWS }, (_, i) => (
      <div
        key={i}
        className="k-flap"
        style={{ width: `${100 - (i * 100) / FLAP_ROWS}%`, height: 1, margin: "0 auto", backgroundColor: ENVELOPE_SAND }}
      />
    ))}
  </div>
);
