import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, Play, Volume2, Music, Sparkles } from "lucide-react";
import { useAudioAnalyzer } from "@/providers.tsx/audio-visualizer-provider";

type TSectionAudioSelectionProps = {
  closeDialog: () => void;
};

const SectionAudioSelection = ({
  closeDialog,
}: TSectionAudioSelectionProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioMode, setAudioMode] = useState<"default" | "custom" | null>(null);
  const { setAudio, play, isAudioUploading } = useAudioAnalyzer();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAudioMode("custom");
      setAudio(file);
    }
  };

  const handleDefaultAudio = () => {
    setAudioMode("default");
    setSelectedFile(null);
    setAudio();
  };

  const handleStart = () => {
    play();
    closeDialog();
  };

  return (
    <div className="w-full relative">
      {/* Mystical background effects */}

      <Card className="relative bg-transparent  w-full border-none ">
        {/* Header */}
        <div className="text-center ">
          <h1 className="text-7xl font-bold bg-gradient-to-r bg-clip-text text-white mb-2">
            Underworld Audio{" "}
            <span className="relative">
              Portal
              <Sparkles className="w-4 h-4 text-blue-300 absolute top-5 -right-1 animate-spin" />
            </span>
          </h1>
          <p className="text-blue-200/70 text-lg">
            Choose your sonic companion for the depths below
          </p>
        </div>

        {/* Audio Options */}
        <div className="space-y-4 px-10">
          {/* Default Audio Option */}
          <div
            className={`relative group cursor-pointer transition-all duration-300 p-4 ${
              audioMode === "default" ? "scale-105" : "hover:scale-102"
            }`}
            onClick={handleDefaultAudio}
          >
            <div
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                audioMode === "default"
                  ? "border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/25"
                  : "border-blue-500/30 bg-gradient-to-r from-blue-800/30 to-slate-800/30 hover:border-blue-400/50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    audioMode === "default"
                      ? "bg-cyan-500/30"
                      : "bg-blue-600/30"
                  }`}
                >
                  <Music className="w-5 h-5 text-cyan-300" />
                </div>
                <div className="flex-1">
                  <h3 className=" text-cyan-100 text-lg">Default Ambience</h3>
                  <p className="text-sm text-blue-100/90">
                    Ethereal depths soundscape
                  </p>
                </div>
                {audioMode === "default" && (
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </div>

          {/* Custom Audio Option */}
          <div
            className={`relative group transition-all duration-300 ${
              audioMode === "custom" ? "scale-105" : "hover:scale-102"
            }`}
          >
            <div
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                audioMode === "custom"
                  ? "border-purple-400 bg-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-lg shadow-purple-500/25"
                  : "border-blue-500/30 bg-gradient-to-r from-blue-800/30 to-slate-800/30 hover:border-blue-400/50"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      audioMode === "custom"
                        ? "bg-purple-500/30"
                        : "bg-blue-600/30"
                    }`}
                  >
                    <Upload className="w-5 h-5 text-purple-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className=" text-cyan-100 text-lg"> Custom Audio</h3>
                    <p className="text-sm text-blue-100/90">
                      Upload your own soundscape
                    </p>
                  </div>
                  {audioMode === "custom" && (
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  )}
                </div>

                <div className="relative">
                  <Input
                    type="file"
                    accept="audio/mp3"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="flex items-center justify-center w-full p-3 border-2 border-dashed border-blue-400/30 rounded-lg cursor-pointer hover:border-blue-400/50 transition-colors bg-blue-900/20"
                  >
                    <div className="text-center">
                      {selectedFile ? (
                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-300 truncate max-w-48">
                            {selectedFile.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-blue-100">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">Choose audio file</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Button */}
        <div className="text-center">
          <Button
            onClick={handleStart}
            className={
              "relative overflow-hidden group px-8 py-3 rounded-xl  transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-blue-500/25 "
            }
            disabled={isAudioUploading}
          >
            <div className="relative flex items-center space-x-2">
              <Play className="w-5 h-5" />

              <p className="text-lg">Begin Descent</p>
            </div>
          </Button>
        </div>

        {/* Status Indicator */}
        {audioMode && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 "></div>
              <span className="text-sm text-blue-200/70">Ready To Explore</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SectionAudioSelection;
