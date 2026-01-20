import {
  Mail,
  MapPin,
  Send,
  Sparkles,
  Github,
  Linkedin,
  FileCode,
  User,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/adarsha-wagle",
      icon: Github,
      iconColor: "text-slate-300",
      username: "adarsha-wagle",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/adarsha-wagle-290837265/",
      icon: Linkedin,
      iconColor: "text-cyan-300",
      username: "adarsha-wagle",
    },
    {
      name: "Dev.to",
      url: "https://dev.to/adarsha_wagle_6b218268d02",
      icon: FileCode,
      iconColor: "text-emerald-300",
      username: "Adarsha Wagle",
    },
  ];

  return (
    <div className="w-full h-full space-y-6 overflow-y-auto max-h-[80vh] pr-2 no-scrollbar">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
          <Mail className="w-8 h-8 text-cyan-400" />
          Contact Me
          <Sparkles className="w-6 h-6 text-cyan-300 inline-block ml-2 animate-spin" />
        </h1>
        <p className="text-blue-200/80 text-lg">Let's Connect & Collaborate</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Form */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <MessageSquare className="w-5 h-5 text-cyan-300" />
            <h3 className="text-xl font-semibold text-cyan-100">
              Send a Message
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-blue-100 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Adarsha Wagle
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-slate-900/50 border-cyan-400/30 text-white placeholder:text-blue-300/50 focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-blue-100 text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                awagle010@gmail.com
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-slate-900/50 border-cyan-400/30 text-white placeholder:text-blue-300/50 focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-blue-100 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Message
              </label>
              <Textarea
                placeholder="Your message here..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={4}
                className="bg-slate-900/50 border-cyan-400/30 text-white placeholder:text-blue-300/50 focus:border-cyan-400 resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Message
            </Button>
          </form>
        </div>

        {/* Contact Info & Social Links */}
        <div className="space-y-6">
          {/* Address */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="w-5 h-5 text-purple-300" />
              <h3 className="text-xl font-semibold text-purple-100">
                Location
              </h3>
            </div>
            <div className="space-y-2">
              <p className="text-blue-100">
                <strong className="text-purple-200">City:</strong> Your City,
                Country
              </p>
              <p className="text-blue-100">
                <strong className="text-purple-200">Email:</strong>{" "}
                your.email@example.com
              </p>
              <p className="text-blue-100 text-sm mt-3 opacity-80">
                Available for freelance opportunities and collaborations
                worldwide.
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/30 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <h3 className="text-xl font-semibold text-emerald-100">
                Connect With Me
              </h3>
            </div>

            <div className="space-y-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-3 rounded-lg bg-slate-800/50 border border-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-[1.02] group"
                >
                  <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-colors">
                    <link.icon className={`w-5 h-5 ${link.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{link.name}</p>
                    <p className="text-blue-200/60 text-sm">{link.username}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
