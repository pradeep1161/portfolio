import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Calendar, Tag, ChevronRight, ArrowLeft, PenTool } from 'lucide-react';
import { API_BASE_URL } from '../context/AuthContext';

export default function BlogSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeBlog, setActiveBlog] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/blogs`);
        setBlogs(res.data);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Could not retrieve blog posts. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const categories = [
    'All', 'Machine Learning', 'AI', 'Python', 'Competitive Programming',
    'Web Development', 'Frontend Development', 'Backend Development', 'Full Stack Development',
    'DevOps & Cloud', 'Cybersecurity', 'Data Science', 'Data Structures & Algorithms',
    'System Design', 'Database', 'Career & Interview Prep', 'Others'
  ];
  const filteredBlogs = selectedCategory === 'All' 
    ? blogs 
    : blogs.filter(b => b.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Fetching blog articles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
      
      {/* Title */}
      <div className="text-center space-y-2 mb-12">
        <div className="inline-flex p-2 bg-indigo-500/10 text-indigo-500 rounded-xl mb-2">
          <BookOpen size={24} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Blogs & Articles</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">Insights, tutorials, and updates on Machine Learning and coding.</p>
        <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full" />
      </div>

      {error ? (
        <div className="glass-panel p-6 text-center max-w-md mx-auto">
          <p className="text-rose-500 font-semibold text-sm">{error}</p>
        </div>
      ) : activeBlog ? (
        // Detailed Blog View
        <div className="max-w-3xl mx-auto space-y-6 animate-scale-up">
          <button
            onClick={() => setActiveBlog(null)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-500 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Articles
          </button>

          <article className="glass-panel p-8 md:p-12 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Tag size={10} />
                {activeBlog.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {activeBlog.title}
              </h2>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                <Calendar size={12} />
                <span>{new Date(activeBlog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6 whitespace-pre-line font-medium">
              {activeBlog.content}
            </div>

            {/* Tags footer */}
            {activeBlog.tags && activeBlog.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-6 border-t border-slate-100 dark:border-slate-800">
                {activeBlog.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        </div>
      ) : (
        // Listing Grid
        <div className="space-y-12">
          {/* Category Selector */}
          <div className="flex justify-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-dark-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="glass-panel p-12 text-center max-w-md mx-auto space-y-2">
              <PenTool size={36} className="text-slate-400 mx-auto animate-pulse" />
              <p className="text-slate-500 font-bold">No articles posted yet.</p>
              <p className="text-xs text-slate-400">Articles published by the administrator will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((b) => (
                <div 
                  key={b.id || b._id} 
                  className="glass-panel p-6 flex flex-col justify-between hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group cursor-pointer"
                  onClick={() => setActiveBlog(b)}
                >
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                      {b.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors leading-snug line-clamp-2">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium">
                      {b.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 text-slate-400 text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(b.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-indigo-500 group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-0.5">
                      Read <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
