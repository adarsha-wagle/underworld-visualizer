import { HelpCircle, Music, Sparkles } from "lucide-react";

const Contact = () => {
  return (
    <div className="w-full h-full space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
          <HelpCircle className="w-8 h-8 text-cyan-400" />
          Contact
          <Sparkles className="w-6 h-6 text-cyan-300 inline-block ml-2 animate-spin" />
        </h1>
        <p className="text-blue-200/80 text-lg">Its So Simple</p>
      </div>
      {/* Contact Content */}
      <div className="space-y-6">
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
                    <strong>Default Ambience:</strong> Click to use the built-in
                    ethereal depths soundscape
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-blue-100">
                    <strong>Custom Audio:</strong> Upload your own MP3 file for
                    a personalized experience
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
