import { useAudioAnalyzer } from "@/providers.tsx/audio-visualizer-provider";
import { Volume2 } from "lucide-react";
import { useState } from "react";

function Volume() {
  const { volume, setVolume } = useAudioAnalyzer();
  const [volumeLevel, setVolumeLevel] = useState<number>(volume * 100);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolumeLevel = Number(e.target.value);
    setVolumeLevel(newVolumeLevel);
    setVolume(newVolumeLevel / 100);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
          <Volume2 className="w-8 h-8 text-cyan-400" />
          Volume Settings
        </h1>
        <p className="text-blue-200/80 text-lg">
          Wear your headphones with confidence
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-blue-300" />
            <h3 className="text-xl font-semibold text-blue-100">
              Volume Level
            </h3>
          </div>
        </div>
        <div className="space-y-2">
          <input
            value={volumeLevel}
            onChange={handleVolumeChange}
            type="range"
            min="1"
            max="100"
            step="4"
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none slider"
          />
          <div className="flex justify-between text-sm text-blue-200/80">
            <span>Mute</span>
            <span>Maximum</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Volume;
