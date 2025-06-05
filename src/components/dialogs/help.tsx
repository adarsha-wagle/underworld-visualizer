import { Card } from "@/components/ui/card";
import { Music, Sparkles } from "lucide-react";

const Help = () => {
  return (
    <div className="w-full relative max-w-2xl">
      <Card className="relative bg-transparent w-full border-none">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r bg-clip-text text-white mb-4">
            Audio Control Guide
            <Sparkles className="w-6 h-6 text-cyan-300 inline-block ml-2 animate-spin" />
          </h1>
          <p className="text-blue-200/80 text-lg">
            Master the sonic depths with these simple steps
          </p>
        </div>

        {/* Help Content */}
        <div className="space-y-6 px-6">
          {/* Step 1: Default Audio */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Music className="w-5 h-5 text-cyan-300" />
                  <h3 className="text-xl font-semibold text-cyan-100">
                    Choose Your Audio Source
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-blue-100">
                      <strong>Default Ambience:</strong> Click to use the
                      built-in ethereal depths soundscape
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-blue-100">
                      <strong>Custom Audio:</strong> Upload your own MP3 file
                      for a personalized experience
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Indicators */}
          <div className="bg-gradient-to-r from-slate-500/10 to-blue-500/10 border border-slate-400/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-slate-300" />
              Controls
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Forward:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-cyan-300 text-sm">W</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Backward:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-300 text-sm">S</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Left:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-300 text-sm">A</span>
                </div>{" "}
              </div>{" "}
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Right:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-300 text-sm">D</span>
                </div>{" "}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Help;
