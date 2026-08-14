import { useEffect, useState } from "react";
import { socials } from "../data/site";
import { usePlayback } from "../hooks/useSessionPlayback";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { chapterIds } from "../lib/catalog";
import { playbackProgress } from "../lib/playback";
import { contextMeter, formatTokens, session } from "../lib/session";
import {
  UPLINK,
  uplinkPhaseAt,
  uplinkReadout,
  type UplinkPhase,
} from "../lib/uplink";

type Props = {
  progress: number;
};

export function SystemStrip({ progress }: Props) {
  const { mode, snap } = usePlayback();
  const reducedMotion = useReducedMotion();
  const [uplink, setUplink] = useState<UplinkPhase>(() =>
    uplinkPhaseAt(0, { reducedMotion }),
  );
  const ids = chapterIds();
  const meter = contextMeter(
    mode === "playing" ? playbackProgress(snap.chapterId, ids) : progress,
  );
  const pct = Math.round(meter.pct * 100);

  useEffect(() => {
    if (reducedMotion) {
      setUplink("locked");
      return;
    }
    setUplink("connecting");
    const timer = window.setTimeout(() => setUplink("locked"), UPLINK.lockMs);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <header className="sys-strip">
      <a className="sys-brand" href="#hero">
        <span className="sys-mark" aria-hidden="true">
          K
        </span>
        <span className="sys-os">{session.os}</span>
      </a>
      <dl className="sys-meters">
        <div>
          <dt>Model</dt>
          <dd>{session.model}</dd>
        </div>
        <div>
          <dt>Context</dt>
          <dd>
            {formatTokens(meter.used)} / {formatTokens(meter.window)}
            <span className="sys-pct"> {pct}%</span>
          </dd>
        </div>
        <div>
          <dt>Tools</dt>
          <dd>{session.tools.length} armed</dd>
        </div>
        <div>
          <dt>Uplink</dt>
          <dd
            className={
              uplink === "connecting" ? "sys-uplink is-acquiring" : "sys-uplink"
            }
          >
            {uplinkReadout(uplink)}
            {uplink === "connecting" ? (
              <span className="uplink-dots" aria-hidden="true" />
            ) : null}
          </dd>
        </div>
      </dl>
      <nav className="sys-links" aria-label="Primary">
        <a href="#side-eye">Catalog</a>
        <a href="#zork-reborn">Games</a>
        <a href="#virtual-stage">Stage</a>
        <a href="#about">Operator</a>
        <a href={socials[0].href} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </nav>
      <p className="sys-status">
        <span className="sys-dot" />
        {mode === "playing" ? "Inferring" : "Nominal"}
      </p>
    </header>
  );
}
