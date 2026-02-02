import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Settings,
  HelpCircle,
  Gamepad2,
  Monitor,
  Volume2,
  User,
  Info,
  Mail,
  Newspaper,
  Briefcase,
} from "lucide-react";
import Help from "./help";
import Controls from "./controls";
import Display from "./display";
import Volume from "./volume";
import About from "./about-me";
// import Projects from "./projects";
import Contact from "./contact";
import Blogs from "./blogs";
import Projects from "./projects";

const appSettingsOptions = [
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

const profileOptions = [
  {
    id: 1,
    label: "About",
    value: "about",
    icon: Info,
  },
  {
    id: 2,
    label: "Projects",
    value: "projects",
    icon: Briefcase,
  },
  {
    id: 4,
    label: "Blogs",
    value: "blogs",
    icon: Newspaper,
  },
  {
    id: 3,
    label: "Contact",
    value: "contact",
    icon: Mail,
  },
];

const SettingsContainer = () => {
  return (
    <div className="w-full h-screen p-6 relative">
      <div className="max-w-7xl mx-auto h-full">
        <Tabs defaultValue="display" className="flex h-full gap-6">
          <div className="flex w-full h-full">
            {/* Left Sidebar with Accordion */}
            <div className="w-1/4 h-full">
              <Card className="h-full bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-auto">
                <div className="p-6">
                  <h2 className="text-4xl font-bold text-white mb-6 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-cyan-400" />
                    Settings
                  </h2>

                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="app-settings"
                    className="w-full space-y-2"
                  >
                    {/* App Settings Accordion */}
                    <AccordionItem
                      value="app-settings"
                      className="border border-slate-600/50 rounded-lg bg-slate-700/20"
                    >
                      <AccordionTrigger className="px-4 text-cyan-100 hover:text-cyan-50 text-xl font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-cyan-400" />
                          App Settings
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-2">
                        <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-2 p-0">
                          {appSettingsOptions.map((option) => (
                            <TabsTrigger
                              key={option.id}
                              value={option.value}
                              className="w-full justify-start gap-3 py-3 px-4 bg-slate-700/30 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-100 data-[state=active]:border-cyan-400/50 border border-transparent hover:bg-slate-600/30 transition-all text-cyan-50 text-base"
                            >
                              <option.icon className="w-4 h-4" />
                              {option.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </AccordionContent>
                    </AccordionItem>

                    {/* My Profile Accordion */}
                    <AccordionItem
                      value="my-profile"
                      className="border border-slate-600/50 rounded-lg bg-slate-700/20"
                    >
                      <AccordionTrigger className="px-4 text-cyan-100 hover:text-cyan-50 text-xl font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-cyan-400" />
                          My Profile
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-2">
                        <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-2 p-0">
                          {profileOptions.map((option) => (
                            <TabsTrigger
                              key={option.id}
                              value={option.value}
                              className="w-full justify-start gap-3 py-3 px-4 bg-slate-700/30 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-100 data-[state=active]:border-cyan-400/50 border border-transparent hover:bg-slate-600/30 transition-all text-cyan-50 text-base"
                            >
                              <option.icon className="w-4 h-4" />
                              {option.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </Card>
            </div>

            {/* Right Content Area */}
            <div className="w-3/4 h-full">
              <Card className="h-full bg-slate-800/30 border-slate-700/50 backdrop-blur-sm overflow-auto">
                <div className="p-6 h-full">
                  {/* App Settings Content */}
                  <TabsContent value="display" className="h-full mt-0">
                    <Display />
                  </TabsContent>
                  <TabsContent value="volume" className="h-full mt-0">
                    <Volume />
                  </TabsContent>
                  <TabsContent value="controls" className="h-full mt-0">
                    <Controls />
                  </TabsContent>
                  <TabsContent value="help" className="h-full mt-0">
                    <Help />
                  </TabsContent>
                  {/* Profile Content */}
                  <TabsContent value="about" className="h-full mt-0">
                    <About />
                  </TabsContent>
                  <TabsContent value="projects" className="h-full mt-0">
                    <Projects />
                  </TabsContent>
                  <TabsContent value="contact" className="h-full mt-0">
                    <Contact />
                  </TabsContent>{" "}
                  <TabsContent value="blogs" className="h-full mt-0">
                    <Blogs />
                  </TabsContent>
                </div>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsContainer;
