import type { CSSProperties } from "react";
import { usePlayback } from "../hooks/useSessionPlayback";

const TICKS = Array.from({ length: 24 }, (_, i) => i);

export function TalkingArc() {
  const { voice } = usePlayback();

  return (
    <div className={`arc arc-${voice}`} aria-hidden="true">
      <span className="arc-ring arc-ring-a">
        <span className="arc-pulse" />
      </span>
      <span className="arc-ring arc-ring-b">
        <span className="arc-pulse" />
      </span>
      <span className="arc-ring arc-ring-c">
        <span className="arc-pulse" />
      </span>
      <span className="arc-ticks">
        {TICKS.map((tick) => (
          <i
            key={tick}
            style={
              {
                "--a": `${tick * 15}deg`,
                animationDelay: `${(tick % 8) * 0.04}s`,
              } as CSSProperties
            }
          />
        ))}
      </span>
      <span className="arc-core" />
    </div>
  );
}
