import { HostStage } from "./HostStage";
import { useReducedMotion } from "../hooks/useReducedMotion";

type Props = {
  progress: number;
};

export function SessionField({ progress }: Props) {
  const reduced = useReducedMotion();

  return (
    <div className="session-field" aria-hidden="true">
      <HostStage progress={progress} reducedMotion={reduced} />
      <div className="session-scan" />
      <span className="corner corner-tl" />
      <span className="corner corner-tr" />
      <span className="corner corner-bl" />
      <span className="corner corner-br" />
    </div>
  );
}
