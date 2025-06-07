import { Monitor, Eye, Sparkles, Save } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useSettingsContext } from "@/providers.tsx/settings-provider";

const sliderMinValue = 0.001;
const sliderMaxValue = 0.005;

function Display() {
  const {
    dispatch,
    isNoiseEnabled: isNoise,
    isBloomEnabled: isBloom,
    isVignetteEnabled: isVignette,
    chromaticAberration: cValue,
  } = useSettingsContext();
  const [isNoiseEnabled, setIsNoiseEnabled] = useState<boolean>(isNoise);
  const [isVignetteEnabled, setIsVignetteEnabled] =
    useState<boolean>(isVignette);
  const [isBloomEnabled, setIsBloomEnabled] = useState<boolean>(isBloom);
  const [sliderValue, setSliderValue] = useState<number>(
    sliderMaxValue - (cValue - sliderMinValue)
  );

  const handleNoiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsNoiseEnabled(e.target.checked);
  };

  const handleVignetteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsVignetteEnabled(e.target.checked);
  };

  const handleGlowEffectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsBloomEnabled(e.target.checked);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseFloat(e.target.value);
    setSliderValue(rawValue);
  };

  const handleSave = () => {
    const chromValue = sliderMaxValue - (sliderValue - sliderMinValue);
    dispatch({
      type: "SET_DISPLAY_SETTINGS",
      payload: {
        isNoiseEnabled: isNoiseEnabled,
        isVignetteEnabled: isVignetteEnabled,
        isBloomEnabled: isBloomEnabled,
        chromaticAberration: chromValue,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
          <Monitor className="w-8 h-8 text-cyan-400" />
          Display Settings
        </h1>
        <p className="text-blue-200/80 text-lg">
          Customize your visual experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Brightness Setting */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-300" />
              <h3 className="text-xl font-semibold text-blue-100">RGB Split</h3>
            </div>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min={sliderMinValue}
              max={sliderMaxValue}
              value={sliderValue}
              step="0.001"
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none slider"
            />
            <div className="flex justify-between text-sm text-blue-200/80">
              <span>Low</span>
              <span>High (Can eat your gpu)</span>
            </div>
          </div>
        </div>

        {/* Visual Effects Setting */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-purple-300" />
              <h3 className="text-xl font-semibold text-purple-100">
                Visual Effects
              </h3>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isNoiseEnabled}
                className="rounded bg-slate-600 border-slate-500"
                onChange={handleNoiseChange}
              />
              <span className="text-blue-100 text-lg">
                Enable Noise effects
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isVignetteEnabled}
                className="rounded bg-slate-600 border-slate-500"
                onChange={handleVignetteChange}
              />
              <span className="text-blue-100 text-lg">Enable Dark Corners</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isBloomEnabled}
                onChange={handleGlowEffectChange}
                className="rounded bg-slate-600 border-slate-500"
              />
              <span className="text-blue-100 text-lg">Enable Glow Effect</span>
            </label>
          </div>
        </div>
      </div>

      <div className="p-6 flex justify-end">
        <Button
          className=" bg-gradient-to-r from-cyan-800 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 text-lg"
          onClick={handleSave}
        >
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default Display;
