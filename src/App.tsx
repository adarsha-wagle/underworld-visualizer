import AppProvider from "./providers.tsx/providers";

import "./App.css";

import SectionVisualizerContainer from "./sections/section_visualizer_container";
import DialogContainer from "./components/dialogs/dialog-container";

// Audio analyzer hook

// Main component
export default function App() {
  return (
    <AppProvider>
      <div className="h-screen w-screen relative">
        <SectionVisualizerContainer />
        <DialogContainer />
      </div>
    </AppProvider>
  );
}
