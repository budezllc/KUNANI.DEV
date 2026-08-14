import { lazy, Suspense } from "react";
import { SystemStrip } from "./components/SystemStrip";
import { CommsRail } from "./components/CommsRail";
import { SessionField } from "./components/SessionField";
import { TalkingArc } from "./components/TalkingArc";
import { Hero } from "./components/Hero";
import { ProjectChapter } from "./components/ProjectChapter";
import { About, Footer } from "./components/About";
import { ListenBar } from "./components/ListenBar";
import { projects } from "./data/projects";
import { useLenis } from "./hooks/useLenis";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useScrollProgress } from "./hooks/useScrollProgress";
import { PlaybackProvider, usePlayback } from "./hooks/useSessionPlayback";
import { useStageMode } from "./hooks/useStageMode";

const StageCanvas = lazy(() =>
  import("./three/StageCanvas").then((mod) => ({ default: mod.StageCanvas })),
);

export default function App() {
  const reduced = useReducedMotion();
  const { scrollTo } = useLenis(!reduced);
  const progress = useScrollProgress();
  const stage = useStageMode();
  const showVolume = stage === "volume" && !reduced;

  return (
    <PlaybackProvider reducedMotion={reduced} scrollTo={scrollTo}>
      <a className="skip" href="#side-eye">
        Skip to work
      </a>
      {showVolume ? (
        <Suspense fallback={<div className="stage-fallback" aria-hidden="true" />}>
          <StageCanvas progress={progress} />
        </Suspense>
      ) : (
        <SessionField progress={progress} />
      )}
      {showVolume ? <TalkingArc /> : null}
      <SystemStrip progress={progress} />
      <CommsRail />
      <ListenBar progress={progress} />
      <SessionReel />
    </PlaybackProvider>
  );
}

function SessionReel() {
  const { mode } = usePlayback();
  return (
    <>
      <main className={mode === "playing" ? "is-playing" : undefined}>
        <Hero />
        {projects.map((project) => (
          <ProjectChapter key={project.slug} project={project} />
        ))}
        <About />
        <div className="reel-end" aria-hidden="true" />
      </main>
      <Footer />
    </>
  );
}
