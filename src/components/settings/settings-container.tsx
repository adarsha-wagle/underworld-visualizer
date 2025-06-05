import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Settings,
  HelpCircle,
  Gamepad2,
  Monitor,
  Volume2,
  ArrowLeft,
} from "lucide-react";
import Help from "./help";
import Controls from "./controls";
import Display from "./display";
import Volume from "./volume";
import { Button } from "../ui/button";

const options = [
  {
    id: 1,
    label: "Display Settings",
    value: "display",
    icon: Monitor,
  },
  {
    id: 2,
    label: "Volume Settings",
    value: "volume",
    icon: Volume2,
  },
  {
    id: 3,
    label: "Controls",
    value: "controls",
    icon: Gamepad2,
  },
  {
    id: 4,
    label: "Help",
    value: "help",
    icon: HelpCircle,
  },
];

const SettingsContainer = () => {
  const goToMenu = () => {
    window.location.href = "/";
  };

  return (
    <div className="w-full h-screen p-6 relative">
      <div className="max-w-7xl mx-auto h-full">
        <Tabs defaultValue="display" className="flex h-full gap-6">
          <div className="flex w-full h-full">
            {/* Left Sidebar with Tabs */}

            <div className="w-1/4 h-full">
              <Card className="h-full bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <div className="p-6">
                  <h2 className="text-4xl font-bold text-white mb-6 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-cyan-400" />
                    Settings
                  </h2>

                  <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-4 p-0 ">
                    {options.map((option) => (
                      <TabsTrigger
                        key={option.id}
                        value={option.value}
                        className="w-full justify-start gap-3 py-4 px-4 bg-slate-700/30 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-100 data-[state=active]:border-cyan-400/50 border border-transparent hover:bg-slate-600/30 transition-all text-cyan-50 text-xl"
                      >
                        <option.icon className="w-5 h-5" />
                        {option.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </Card>
            </div>

            {/* Right Content Area */}
            <div className="w-3/4 h-full">
              <Card className="h-full bg-slate-800/30 border-slate-700/50 backdrop-blur-sm overflow-auto">
                <div className="p-6 h-full">
                  {/* Display Settings Tab */}
                  <TabsContent value="display" className="h-full mt-0">
                    <Display />
                  </TabsContent>
                  <TabsContent value="volume" className="h-full mt-0">
                    <Volume />
                  </TabsContent>
                  {/* Help Tab */}
                  <TabsContent value="help" className="h-full mt-0">
                    <Help />
                  </TabsContent>
                  {/* Controls Tab */}
                  <TabsContent value="controls" className="h-full mt-0">
                    <Controls />
                  </TabsContent>
                </div>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <Button
          className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-500 hover:to-slate-600 text-white py-4 px-8 rounded-xl shadow-2xl hover:shadow-slate-500/30 transform hover:scale-105 transition-all duration-300 border-2 border-slate-400/50 hover:border-slate-300/70 text-lg"
          onClick={goToMenu}
        >
          <ArrowLeft className="w-6 h-6 mr-3" />
          Go to Menu
        </Button>
      </div>
    </div>
  );
};

export default SettingsContainer;
