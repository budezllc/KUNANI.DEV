import { projects } from "../data/projects";
import { site } from "../data/site";
import { usePlayback } from "../hooks/useSessionPlayback";
import { activeChapterId, session } from "../lib/session";

type Props = {
  progress: number;
};

export function ListenBar({ progress }: Props) {
  const { mode, snap } = usePlayback();
  const id = mode === "playing" ? snap.chapterId : activeChapterId(progress);
  const project = projects.find((item) => item.slug === id);
  const title = project?.title ?? (id === "hero" ? session.model : site.person);
  const bars = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div className="listen-bar" aria-hidden="true">
      <span className="listen-live">
        <span className="listen-dot" />
        {mode === "playing" ? "Inferring" : "Listening"}
      </span>
      <span className="wave">
        {bars.map((bar) => (
          <i key={bar} style={{ animationDelay: `${bar * 0.07}s` }} />
        ))}
      </span>
      <span className="listen-channel">TX / RX</span>
      <span className="listen-title">{title}</span>
    </div>
  );
}
