import { BookOpen, Sparkles, ArrowRight } from "lucide-react";

const Blogs = () => {
  const blogs = [
    {
      id: 1,
      title: "Understanding 'Key' in React And, Why It Matters",
      excerpt:
        "When working with lists in React, you've probably seen a warning about missing key props...",
      date: "Jan 20, 2026",
      readTime: "12 min read",
      tags: ["React", "Performance"],
      isFeatured: true,
      link: "https://dev.to/adarsha_wagle_6b218268d02/understanding-keys-in-react-why-they-matter-1h7i",
    },
    {
      id: 2,
      title: "Mastering TypeScript for Web Development",
      excerpt:
        "A comprehensive guide to leveraging TypeScript's powerful type system.",
      date: "Jan 10, 2025",
      readTime: "6 min read",
      tags: ["TypeScript", "Web Dev"],
    },
    {
      id: 3,
      title: "CSS Grid vs Flexbox: When to Use What",
      excerpt:
        "Understanding the differences and use cases for CSS Grid and Flexbox layouts.",
      date: "Jan 5, 2025",
      readTime: "5 min read",
      tags: ["CSS", "Layout"],
    },
  ];

  return (
    <div className="w-full h-full space-y-6 overflow-y-auto max-h-[80vh] pr-2 no-scrollbar">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
          <BookOpen className="w-8 h-8 text-cyan-400" />
          My Blogs
          <Sparkles className="w-6 h-6 text-cyan-300 ml-2 animate-spin" />
        </h1>
        <p className="text-blue-200/80 text-lg">
          Thoughts, tutorials & insights
        </p>
      </div>

      <div className="grid gap-4">
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            title={blog.title}
            excerpt={blog.excerpt}
            date={blog.date}
            readTime={blog.readTime}
            tags={blog.tags}
            isFeatured={blog.isFeatured}
            link={blog.link}
          />
        ))}
      </div>

      <div className="text-center pt-4">
        <button className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg text-cyan-300 font-medium hover:border-cyan-400/50 transition-all flex items-center gap-2 mx-auto">
          View All Articles
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Blogs;

import { Calendar, Clock, Tag } from "lucide-react";

type BlogCardProps = {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  isFeatured?: boolean;
  link?: string;
};

export const BlogCard = ({
  title,
  excerpt,
  date,
  readTime,
  tags,
  isFeatured = false,
  link,
}: BlogCardProps) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    link ? (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {children}
      </a>
    ) : (
      <>{children}</>
    );

  return (
    <Wrapper>
      {isFeatured ? (
        /* ===== FEATURED BLOG ===== */
        <div className="bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-400/40 rounded-xl p-6 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-cyan-500/30 text-cyan-200 text-xs font-semibold rounded-full">
              Featured
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
            {title}
          </h2>

          <p className="text-blue-100/80 mb-4 leading-relaxed">{excerpt}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-blue-200/60 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {readTime}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-slate-700/50 text-cyan-300 text-xs rounded-md flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center text-cyan-400 font-medium group-hover:gap-3 gap-2 transition-all">
            Read More <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      ) : (
        /* ===== NORMAL BLOG ===== */
        <div className="bg-slate-800/40 border border-cyan-400/20 rounded-xl p-5 hover:border-cyan-400/40 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer group">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                {title}
              </h3>

              <p className="text-blue-100/70 text-sm mb-3 line-clamp-2">
                {excerpt}
              </p>

              <div className="flex items-center gap-4 text-blue-200/50 text-xs">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {readTime}
                </span>

                <div className="flex items-center gap-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-700/50 text-cyan-300/80 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-cyan-400/50 group-hover:text-cyan-400 transition-colors mt-1" />
          </div>
        </div>
      )}
    </Wrapper>
  );
};
