import React from "react";
import { AudioVisualizerProvider } from "./audio-visualizer-provider";

function AppProvider({ children }: { children: React.ReactNode }) {
  return <AudioVisualizerProvider>{children}</AudioVisualizerProvider>;
}

export default AppProvider;
