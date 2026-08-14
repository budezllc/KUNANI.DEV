import { useEffect, useState } from "react";
import { parseStageMode, type StageMode } from "../lib/stageMode";

export function useStageMode(): StageMode {
  const [mode, setMode] = useState<StageMode>("session");
  useEffect(() => {
    setMode(parseStageMode(window.location.search));
  }, []);
  return mode;
}
