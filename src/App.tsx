import { useState } from "react";
import { Stats } from "@react-three/drei";

import AppProvider from "./providers.tsx/providers";

import "./App.css";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";

import UnderwaterExploration from "./components/environment/terrain";
import SectionVisualizerContainer from "./sections/section_visualizer_container";
import SectionAudioSelection from "./sections/section_audio_selection";

// Audio analyzer hook

// Main component
export default function App() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(true);

  return (
    <AppProvider>
      <div style={{ height: "100vh", width: "100vw" }} className="bg-red-300">
        <SectionVisualizerContainer />{" "}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            aria-describedby="audio-selection"
            className="p-0 [&>button]:hidden border-0 shadow-none ring-0 outline-none  max-w-2xl rounded-none"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader className="hidden">
              <DialogTitle>Audio Selection</DialogTitle>
            </DialogHeader>
            <SectionAudioSelection />
          </DialogContent>
        </Dialog>
        <Stats />
      </div>
    </AppProvider>
  );
}
