import { useMemo } from "react";
import { site } from "../data/site";
import { usePlayback } from "../hooks/useSessionPlayback";
import type { CommsRole } from "../lib/session";
import { StreamText } from "./StreamText";

const ROLE_LABEL: Record<CommsRole, string> = {
  system: "SYS",
  rx: "RX",
  thinking: "THINK",
  tool: "TOOL",
  tx: "TX",
};

export function CommsRail() {
  const { events, view } = usePlayback();
  const visible = useMemo(
    () =>
      events
        .map((event) => ({ event, shown: view(event.id) }))
        .filter((item) => item.shown.show)
        .slice(-10),
    [events, view],
  );

  return (
    <aside className="comms" aria-hidden="true">
      <p className="comms-head">Comms · {site.person}</p>
      <ol className="comms-log">
        {visible.map(({ event, shown }) => (
          <li key={event.id} className={`comms-line comms-${event.role}`}>
            <span className="comms-role">{ROLE_LABEL[event.role]}</span>
            <span className="comms-body">
              <StreamText text={shown.text} caret={shown.caret} />
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
