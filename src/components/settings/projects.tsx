import {
  FolderGit2,
  ExternalLink,
  Github,
  Sparkles,
  Code2,
  Layers,
} from "lucide-react";

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      description:
        "A full-featured e-commerce solution with cart management, payment integration, and admin dashboard.",
      techStack: ["React", "Node.js", "MongoDB", "Stripe"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/yourusername/project1",
      featured: true,
    },
    {
      id: 2,
      title: "Task Management App",
      description:
        "A collaborative task management tool with real-time updates and team workspaces.",
      techStack: ["TypeScript", "Next.js", "PostgreSQL"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/yourusername/project2",
      featured: true,
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description:
        "Real-time weather tracking with location-based forecasts and interactive maps.",
      techStack: ["React", "Tailwind", "API"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/yourusername/project3",
      featured: false,
    },
    {
      id: 4,
      title: "Portfolio Website",
      description:
        "A modern portfolio showcasing projects and skills with smooth animations.",
      techStack: ["React", "Framer Motion"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/yourusername/project4",
      featured: false,
    },
    {
      id: 5,
      title: "Chat Application",
      description:
        "Real-time messaging app with group chats, file sharing, and notifications.",
      techStack: ["React", "Socket.io", "Express"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/yourusername/project5",
      featured: false,
    },
    {
      id: 6,
      title: "Blog CMS",
      description:
        "A content management system for creating and managing blog posts with markdown support.",
      techStack: ["Next.js", "Prisma", "MDX"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/yourusername/project6",
      featured: false,
    },
  ];

  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  return (
    <div className="w-full h-full space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
          <FolderGit2 className="w-8 h-8 text-cyan-400" />
          My Projects
          <Sparkles className="w-6 h-6 text-cyan-300 inline-block ml-2 animate-spin" />
        </h1>
        <p className="text-blue-200/80 text-lg">Things I've built & shipped</p>
      </div>

      {/* Featured Projects */}
      <div className="grid md:grid-cols-2 gap-6">
        {featuredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border border-cyan-400/40 rounded-xl p-6 hover:border-cyan-400/60 transition-all duration-300 group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-cyan-500/30 text-cyan-200 text-xs font-semibold rounded-full flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Featured
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
              {project.title}
            </h3>
            <p className="text-blue-100/70 text-sm mb-4 leading-relaxed">
              {project.description}
            </p>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-slate-700/60 text-cyan-300 text-xs rounded-md flex items-center gap-1"
                >
                  <Code2 className="w-3 h-3" />
                  {tech}
                </span>
              ))}
            </div>

            {/* Links */}
            <div className="flex items-center gap-3 pt-2 border-t border-cyan-400/20">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-300 text-sm hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                Source Code
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Other Projects */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-cyan-100 mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-cyan-400" />
          Other Projects
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherProjects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-800/40 border border-cyan-400/20 rounded-xl p-4 hover:border-cyan-400/40 hover:bg-slate-800/60 transition-all duration-300 group"
            >
              <h4 className="text-md font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                {project.title}
              </h4>
              <p className="text-blue-100/60 text-xs mb-3 line-clamp-2">
                {project.description}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1 mb-3">
                {project.techStack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="px-1.5 py-0.5 bg-slate-700/50 text-cyan-300/80 text-xs rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex items-center gap-3">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400/70 hover:text-cyan-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
