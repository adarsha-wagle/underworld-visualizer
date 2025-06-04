import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, Play, Volume2, Waves, Music, Sparkles } from "lucide-react";
import { Fish } from "lucide-react";

const SectionAudioSelection = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioMode, setAudioMode] = useState<"default" | "custom" | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAudioMode("custom");
    }
  };

  const handleDefaultAudio = () => {
    setAudioMode("default");
    setSelectedFile(null);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full relative">
      {/* Swimming Fish */}
      <div className="absolute inset-0 pointer-events-none">
        <Fish className="absolute top-20 left-10 w-6 h-6 text-cyan-300/60 animate-[swim_8s_ease-in-out_infinite]" />
        <Fish className="absolute top-40 right-16 w-4 h-4 text-blue-300/50 animate-[swim_6s_ease-in-out_infinite_reverse] scale-x-[-1]" />
        <Fish className="absolute bottom-32 left-20 w-5 h-5 text-teal-300/70 animate-[swim_10s_ease-in-out_infinite_2s]" />
        <Fish className="absolute bottom-60 right-8 w-3 h-3 text-cyan-400/40 animate-[swim_7s_ease-in-out_infinite_1s] scale-x-[-1]" />
        <Fish className="absolute top-1/2 left-5 w-4 h-4 text-blue-200/60 animate-[swim_9s_ease-in-out_infinite_3s]" />
      </div>

      {/* Coral Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-10 left-8 w-16 h-20 bg-gradient-to-t from-pink-500/20 to-transparent rounded-t-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-12 w-12 h-16 bg-gradient-to-t from-purple-500/20 to-transparent rounded-t-full animate-pulse delay-1500"></div>
        <div className="absolute bottom-10 right-10 w-14 h-18 bg-gradient-to-t from-orange-500/20 to-transparent rounded-t-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-10 right-16 w-10 h-14 bg-gradient-to-t from-red-500/20 to-transparent rounded-t-full animate-pulse delay-500"></div>
      </div>

      {/* Floating Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-cyan-400/30 rounded-full animate-[float_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-16 left-1/3 w-1 h-1 bg-blue-300/40 rounded-full animate-[float_3s_ease-in-out_infinite_1s]"></div>
        <div className="absolute bottom-24 right-1/4 w-2 h-2 bg-teal-400/35 rounded-full animate-[float_5s_ease-in-out_infinite_2s]"></div>
        <div className="absolute bottom-14 right-1/3 w-1 h-1 bg-cyan-300/45 rounded-full animate-[float_3.5s_ease-in-out_infinite_0.5s]"></div>
      </div>

      <div className="relative">
        {/* Mystical background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl animate-pulse"></div>
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-400/30 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-400/30 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-1/2 -left-8 w-4 h-4 bg-cyan-400/40 rounded-full animate-ping delay-700"></div>

        <Card className="relative bg-gradient-to-br from-slate-800/90 to-blue-950/90 backdrop-blur-lg border border-blue-500/30 shadow-2xl shadow-blue-900/50 w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Waves className="w-8 h-8 text-cyan-400 animate-pulse" />
                <Sparkles className="w-4 h-4 text-blue-300 absolute -top-1 -right-1 animate-spin" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-2">
              Underworld Audio Portal
            </h1>
            <p className="text-blue-200/70 text-sm">
              Choose your sonic companion for the depths below
            </p>
          </div>

          {/* Audio Options */}
          <div className="space-y-4 mb-6">
            {/* Default Audio Option */}
            <div
              className={`relative group cursor-pointer transition-all duration-300 ${
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
                    <h3 className="font-semibold text-cyan-100">
                      Default Ambience
                    </h3>
                    <p className="text-xs text-blue-200/60">
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
                      <h3 className="font-semibold text-purple-100">
                        Custom Audio
                      </h3>
                      <p className="text-xs text-blue-200/60">
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
                      accept="audio/*"
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
                          <div className="flex items-center space-x-2 text-blue-200/70">
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
          {audioMode && (
            <div className="text-center">
              <Button
                onClick={togglePlayback}
                className={`relative overflow-hidden group px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isPlaying
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/25"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-blue-500/25"
                }`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <div className="relative flex items-center space-x-2">
                  <Play
                    className={`w-5 h-5 ${isPlaying ? "animate-pulse" : ""}`}
                  />
                  <span>{isPlaying ? "Stop Journey" : "Begin Descent"}</span>
                </div>
              </Button>
            </div>
          )}

          {/* Status Indicator */}
          {audioMode && (
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? "bg-green-400 animate-pulse" : "bg-blue-400"
                  }`}
                ></div>
                <span className="text-xs text-blue-200/70">
                  {isPlaying ? "Exploring the depths..." : "Ready to explore"}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SectionAudioSelection;
