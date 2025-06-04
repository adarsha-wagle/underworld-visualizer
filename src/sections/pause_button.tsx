import { Button } from "@/components/ui/button";
import { useAudioAnalyzer } from "@/providers.tsx/audio-visualizer-provider";
import { Pause, Play } from "lucide-react";

function PauseButton() {
  const { pause, play, isPlaying } = useAudioAnalyzer();

  const handlePause = () => {
    pause();
  };

  const handlePlay = () => {
    play();
  };

  return (
    <div className="absolute top-4 right-2 z-[100]">
      {isPlaying ? (
        <Button onClick={handlePause}>
          <Pause className="size-10 text-white fill-white" />
        </Button>
      ) : (
        <Button onClick={handlePlay}>
          <Play className="size-10 text-white fill-white" />
        </Button>
      )}
    </div>
  );
}

export default PauseButton;
