import {
  HelpCircle,
  Sparkles,
  Briefcase,
  Calendar,
  MapPin,
  Code,
  GraduationCap,
} from "lucide-react";

const AboutMe = () => {
  const experiences = [
    {
      year: "2020 - 2022",
      role: "Freelance Web Developer",
      company: "Self-employed..",
      location: "Remote",
      description:
        "Built and maintained multiple web applications, implemented CI/CD pipelines, and optimized database performance.",
      skills: ["React", "NodeJs", "Typescript", "Javascript", "HTML/CSS"],
      color: "purple",
    },
    {
      year: "2023 - 2024",
      role: "Frontend Developer",
      company: "Blackmoon Pvt. Ltd.",
      location: "Ekantakuna, Lalitpur",
      description:
        "Started my journey in web development, learned agile methodologies, and contributed to various client projects.",
      skills: ["React", "HTML/CSS", "Git", "NodeJs", "Javascript"],
      color: "blue",
    },
  ];

  return (
    <div className="w-full h-full space-y-6 overflow-y-auto max-h-[80vh] pr-2 no-scrollbar">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
          <HelpCircle className="w-8 h-8 text-cyan-400" />
          About Me
          <Sparkles className="w-6 h-6 text-cyan-300 inline-block ml-2 animate-spin" />
        </h1>
        <p className="text-blue-200/80 text-lg">
          Passionate Developer | Creative Problem Solver
        </p>
      </div>

      {/* Personal Info Section */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 p-1">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-900/50 to-blue-900/50 backdrop-blur-sm flex items-center justify-center overflow-hidden relative">
              <img
                src="/images/profile.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-600/20 mix-blend-overlay"></div>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-cyan-100 mb-2">
              Adarsha Wagle
            </h2>
            <div className="flex flex-wrap gap-3 mb-3">
              <span className="flex items-center gap-1 text-blue-200 text-sm">
                <MapPin className="w-4 h-4" /> Kathmandu, Nepal
              </span>
              <span className="flex items-center gap-1 text-blue-200 text-sm">
                <Briefcase className="w-4 h-4" /> 2+ Years Experience
              </span>
              <span className="flex items-center gap-1 text-blue-200 text-sm">
                <GraduationCap className="w-4 h-4" /> B.E. IT
              </span>
            </div>
            <p className="text-blue-100/80 leading-relaxed">
              A dedicated software engineer with a passion for creating elegant,
              user-centric applications. I thrive on turning complex problems
              into simple, beautiful solutions. When I'm not coding, you'll find
              me exploring new technologies and contributing to open-source
              projects.
            </p>
          </div>
        </div>
      </div>

      {/* Experience Section Header */}
      <div className="flex items-center gap-3 mt-8">
        <Briefcase className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">Experience Journey</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
      </div>

      {/* Experience Timeline */}
      <div className="relative space-y-6 ml-4">
        {/* Timeline Line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-cyan-400 via-purple-400 to-blue-400"></div>

        {experiences.map((exp, index) => (
          <div key={index} className="relative pl-10">
            {/* Timeline Dot */}
            <div
              className={`absolute left-0 top-2 w-6 h-6 rounded-full bg-gradient-to-br ${
                exp.color === "cyan"
                  ? "from-cyan-400 to-cyan-600"
                  : exp.color === "purple"
                    ? "from-purple-400 to-purple-600"
                    : "from-blue-400 to-blue-600"
              } flex items-center justify-center shadow-lg shadow-${exp.color}-500/30`}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>

            {/* Experience Card */}
            <div
              className={`bg-gradient-to-r ${
                exp.color === "cyan"
                  ? "from-cyan-500/10 to-cyan-600/5 border-cyan-400/30 hover:border-cyan-300/50"
                  : exp.color === "purple"
                    ? "from-purple-500/10 to-purple-600/5 border-purple-400/30 hover:border-purple-300/50"
                    : "from-blue-500/10 to-blue-600/5 border-blue-400/30 hover:border-blue-300/50"
              } border rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-${exp.color}-500/10 hover:translate-x-1`}
            >
              {/* Year Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    exp.color === "cyan"
                      ? "bg-cyan-500/20 text-cyan-300"
                      : exp.color === "purple"
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  {exp.year}
                </span>
                <span className="flex items-center gap-1 text-blue-200/60 text-sm">
                  <MapPin className="w-3 h-3" />
                  {exp.location}
                </span>
              </div>

              {/* Role & Company */}
              <h3
                className={`text-xl font-bold ${
                  exp.color === "cyan"
                    ? "text-cyan-100"
                    : exp.color === "purple"
                      ? "text-purple-100"
                      : "text-blue-100"
                } mb-1`}
              >
                {exp.role}
              </h3>
              <p
                className={`text-lg font-medium ${
                  exp.color === "cyan"
                    ? "text-cyan-300/80"
                    : exp.color === "purple"
                      ? "text-purple-300/80"
                      : "text-blue-300/80"
                } mb-3`}
              >
                {exp.company}
              </p>

              {/* Description */}
              <p className="text-blue-100/70 mb-4 leading-relaxed">
                {exp.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2">
                {exp.skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                      exp.color === "cyan"
                        ? "bg-cyan-500/15 text-cyan-200 border border-cyan-500/20"
                        : exp.color === "purple"
                          ? "bg-purple-500/15 text-purple-200 border border-purple-500/20"
                          : "bg-blue-500/15 text-blue-200 border border-blue-500/20"
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements Section */}
      {/* <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-400/30 rounded-xl p-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-purple-100">
            Key Achievements
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-3xl font-bold text-cyan-400 mb-1">50+</div>
            <div className="text-blue-200/70 text-sm">Projects Completed</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-3xl font-bold text-purple-400 mb-1">2+</div>
            <div className="text-blue-200/70 text-sm">Years Experience</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-3xl font-bold text-blue-400 mb-1">15+</div>
            <div className="text-blue-200/70 text-sm">Happy Clients</div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default AboutMe;
