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

import SectionVisualizerContainer from "./sections/section_visualizer_container";
import SectionAudioSelection from "./sections/section_audio_selection";
import PauseButton from "./sections/pause_button";

// Audio analyzer hook

// Main component
export default function App() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(true);

  return (
    <AppProvider>
      <div className="h-screen w-screen relative">
        <SectionVisualizerContainer />
        {!isDialogOpen && <PauseButton />}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            aria-describedby="audio-selection"
            className="p-0 [&>button]:hidden border-0 shadow-none ring-0 outline-none  max-w-2xl rounded-none bg-transparent"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader className="hidden">
              <DialogTitle>Audio Selection</DialogTitle>
            </DialogHeader>
            <SectionAudioSelection closeDialog={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
        <Stats />
      </div>
    </AppProvider>
  );
}
