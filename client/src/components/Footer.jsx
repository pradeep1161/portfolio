import { Github, Linkedin, Mail, Heart } from 'lucide-react';

export default function Footer({ profile, visitorCount }) {
  if (!profile) return null;

  return (
    <footer className="w-full bg-slate-900/90 dark:bg-dark-bg/90 border-t border-slate-200/50 dark:border-slate-800/50 py-8 relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand/Status */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Pradeep Tallapally
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              AI & Machine Learning Engineer
            </p>
            {profile.seekingInternship && (
              <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Seeking AI/ML Internships
              </span>
            )}
          </div>

          {/* Social Icons */}
          <div className="flex space-x-4">
            <a
              href={profile.socials.github || 'https://github.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white transition-all duration-300"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
            <a
              href={profile.socials.linkedin || 'https://linkedin.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white transition-all duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white transition-all duration-300"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>
          
          {/* Stats & Copyright */}
          <div className="text-center md:text-right">
            {visitorCount > 0 && (
              <p className="text-xs text-slate-400 mb-1">
                Portfolio Views: <span className="font-bold text-indigo-400">{visitorCount}</span>
              </p>
            )}
            <p className="text-xs text-slate-500 flex items-center justify-center md:justify-end gap-1">
              Made with <Heart size={10} className="text-red-500 fill-current animate-pulse" /> © {new Date().getFullYear()} All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
