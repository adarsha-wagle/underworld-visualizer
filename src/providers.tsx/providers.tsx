import React from "react";
import { AudioVisualizerProvider } from "./audio-visualizer-provider";
import { SettingsProvider } from "./settings-provider";

function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <AudioVisualizerProvider>{children}</AudioVisualizerProvider>
    </SettingsProvider>
  );
}

export default AppProvider;
