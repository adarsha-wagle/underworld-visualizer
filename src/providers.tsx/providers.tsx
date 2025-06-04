import React, { Suspense } from "react";
import { AudioVisualizerProvider } from "./audio-visualizer-provider";
import Loader from "@/components/loader/loader";

function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loader />}>
      <AudioVisualizerProvider>{children}</AudioVisualizerProvider>;
    </Suspense>
  );
}

export default AppProvider;
