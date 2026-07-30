import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Github, Linkedin, Mail, MapPin, Phone, ExternalLink, FileDown, 
  Terminal, Cpu, Code, Database, BookOpen, Briefcase, Award, 
  Send, ShieldCheck, Sparkles, CheckCircle, ChevronRight, User, X,
  MessageCircle, Instagram
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { API_BASE_URL } from '../context/AuthContext';

export default function PublicPortfolio({ portfolio, setVisitorCount }) {
  const [profile, setProfile] = useState(null);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Filter and Modal States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeProjectModal, setActiveProjectModal] = useState(null);

  // Coding Profile Stats State
  const [codingStats, setCodingStats] = useState({
    github: { loading: true, data: null },
    leetcode: { loading: true, data: null },
    codechef: { loading: true, data: null },
    codeforces: { loading: true, data: null },
    hackerrank: { loading: true, data: null },
    smartinterviews: { loading: true, data: null }
  });
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState({ submitting: false, success: false, error: null });

  // Typing effect state
  const [typedText, setTypedText] = useState('');
  const typingPhrases = [
    "Building AI solutions for Healthcare and Real-world Problems.",
    "Specializing in Computer Vision, Deep Learning, and Full Stack Dev.",
    "Designing smart systems using EfficientNet, CNN, and Gemini AI."
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (portfolio) {
      setProfile(portfolio.profile);
      setEducation(portfolio.education);
      setSkills(portfolio.skills);
      setExperience(portfolio.experience);
      setProjects(portfolio.projects);
      setCertifications(portfolio.certifications);
      setAchievements(portfolio.achievements);
    }
  }, [portfolio]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [profile?.avatar]);

  // Track page view on mount
  useEffect(() => {
    const trackView = async () => {
      try {
        // Simple country deduction by locale timezone
        let country = 'India';
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz.includes('America')) country = 'USA';
          else if (tz.includes('Europe')) country = 'Germany';
          else if (tz.includes('Asia/Kolkata')) country = 'India';
        } catch {
          // Intl API unsupported; keep default country
        }

        const res = await axios.post(`${API_BASE_URL}/api/analytics/view`, { country });
        if (res.data && res.data.totalViews) {
          setVisitorCount(res.data.totalViews);
        }
      } catch (err) {
        console.error('Analytics view tracking failed:', err);
      }
    };
    trackView();
  }, [setVisitorCount]);

  // Typing Effect Loop
  useEffect(() => {
    const currentPhrase = typingPhrases[phraseIndex];
    let timer;

    if (isDeleting) {
      timer = setTimeout(() => {
        setTypedText(currentPhrase.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      }, 30);
    } else {
      timer = setTimeout(() => {
        setTypedText(currentPhrase.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      }, 60);
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      timer = setTimeout(() => setIsDeleting(true), 2500); // Wait before deleting
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPhraseIndex(prev => (prev + 1) % typingPhrases.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex]);

  // Fetch Coding Profiles once usernames are loaded
  useEffect(() => {
    if (profile && profile.socials) {
      const fetchStats = async (platform, username) => {
        if (!username) {
          setCodingStats(prev => ({
            ...prev,
            [platform]: { loading: false, data: null }
          }));
          return;
        }

        try {
          const res = await axios.get(`${API_BASE_URL}/api/coding-profiles/${platform}/${username}`);
          setCodingStats(prev => ({
            ...prev,
            [platform]: { loading: false, data: res.data }
          }));
        } catch {
          setCodingStats(prev => ({
            ...prev,
            [platform]: { loading: false, data: null, error: true }
          }));
        }
      };

      // Extracted usernames (GitHub is loaded, others might be empty until user sets them)
      const getUsername = (url) => {
        if (!url) return '';
        const normalized = url.trim().replace(/\/+$/, '');
        const withoutQuery = normalized.split('?')[0];
        const parts = withoutQuery.split('/');
        return parts[parts.length - 1] || '';
      };

      fetchStats('github', getUsername(profile.socials.github) || 'pradeep1161');
      fetchStats('leetcode', getUsername(profile.socials.leetcode));
      fetchStats('codechef', getUsername(profile.socials.codechef));
      fetchStats('codeforces', getUsername(profile.socials.codeforces));
      fetchStats('hackerrank', getUsername(profile.socials.hackerrank));
      fetchStats('smartinterviews', getUsername(profile.socials.smartinterviews));
    }
  }, [profile]);

  const resolveAssetUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
    return url;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ submitting: true, success: false, error: null });

    try {
      await axios.post(`${API_BASE_URL}/api/analytics/messages`, contactForm);
      setFormStatus({ submitting: false, success: true, error: null });
      setContactForm({ name: '', email: '', subject: '', message: '' });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.9 }
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send message. Please try again.';
      setFormStatus({ submitting: false, success: false, error: msg });
    }
  };

  const getSkillCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'programming': return <Terminal className="text-indigo-500" size={20} />;
      case 'web': return <Code className="text-pink-500" size={20} />;
      case 'database': return <Database className="text-emerald-500" size={20} />;
      case 'machine learning': return <Cpu className="text-purple-500" size={20} />;
      case 'cs fundamentals': return <BookOpen className="text-amber-500" size={20} />;
      default: return <Sparkles className="text-indigo-500" size={20} />;
    }
  };

  const projectCategories = [
    'All', 'AI & Deep Learning', 'Machine Learning', 'Web Development', 'Frontend Development',
    'Backend Development', 'Full Stack Development', 'Mobile Development', 'DevOps & Cloud',
    'Cybersecurity', 'Data Science', 'Data Analytics', 'UI/UX', 'Blockchain', 'IoT',
    'Game Development', 'Automation & Scripting', 'Others'
  ];
  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || p.title.toLowerCase().includes(selectedCategory.toLowerCase()));

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400 bg-slate-900">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="animate-pulse">Loading Pradeep's Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen z-10">
      
      {/* 1. HERO SECTION */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl glow-indigo pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl glow-purple pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Hero Content */}
          <div className="md:col-span-7 text-center md:text-left space-y-6 order-2 md:order-1">
            {profile.seekingInternship && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 mr-2 rounded-full bg-emerald-500 animate-pulse" />
                Seeking AI/ML Internship Opportunities
              </span>
            )}
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Hi, I'm <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">{profile.name}</span>
            </h1>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200">
              {profile.title}
            </h2>

            {/* Typing Container */}
            <div className="h-16 flex items-center justify-center md:justify-start">
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                {typedText}
                <span className="inline-block w-1.5 h-5 bg-indigo-500 ml-1 animate-pulse" />
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
              <a
                href="#projects"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl text-center shadow-lg shadow-indigo-500/20 hover:scale-102 active:scale-98 transition-all"
              >
                View Projects
              </a>
              {profile.resumeUrl && (
                <a
                  href={resolveAssetUrl(profile.resumeUrl)}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold rounded-xl hover:scale-102 active:scale-98 transition-all"
                >
                  <FileDown size={18} />
                  Download Resume
                </a>
              )}
              <a
                href="#contact"
                className="w-full sm:w-auto px-6 py-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-center hover:scale-102 active:scale-98 transition-all"
              >
                Contact Me
              </a>
            </div>
          </div>

          {/* Hero Photo Card */}
          <div className="md:col-span-5 flex justify-center order-1 md:order-2">
            <div className="relative group">
              {/* Spinning outline design */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
              
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 glass-panel border overflow-hidden flex items-center justify-center p-2 group-hover:scale-102 transition-transform duration-500">
                {profile.avatar && !avatarLoadFailed ? (
                  <img
                    src={resolveAssetUrl(profile.avatar)}
                    alt={profile.name}
                    className="w-full h-full object-cover rounded-xl"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <User size={64} className="text-indigo-500 animate-float" />
                    <p className="text-xs mt-2 uppercase tracking-widest font-bold">Avatar placeholder</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section id="about" className="py-20 bg-slate-50/50 dark:bg-dark-bg/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">About Me</h2>
            <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full" />
          </div>
          
          <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed text-center md:text-left font-medium">
              {profile.bio}
            </p>
          </div>
        </div>
      </section>

      {/* 3. SKILLS SECTION */}
      <section id="skills" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Technical Skills</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Technologies and languages I have experience working with.</p>
            <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full" />
          </div>

          {/* Group Skills by Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(
              skills.reduce((acc, skill) => {
                acc[skill.category] = acc[skill.category] || [];
                acc[skill.category].push(skill);
                return acc;
              }, {})
            ).map(([category, catSkills]) => (
              <div key={category} className="glass-panel p-6 hover:scale-102 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
                  {getSkillCategoryIcon(category)}
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{category}</h3>
                </div>
                
                <div className="space-y-4">
                  {catSkills.map((skill) => (
                    <div key={skill.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        {/* Interactive animation width */}
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. EXPERIENCE & EDUCATION TIMELINE */}
      <section id="experience" className="py-20 bg-slate-50/50 dark:bg-dark-bg/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Experience timeline */}
            <div>
              <div className="flex items-center gap-3 mb-12">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                  <Briefcase size={22} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Experience</h2>
              </div>
              
              <div className="relative border-l-2 border-indigo-500/20 ml-4 pl-8 space-y-12">
                {experience.map((item) => (
                  <div key={item.id} className="relative">
                    {/* Circle marker */}
                    <span className="absolute -left-12 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-dark-bg border-4 border-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20" />
                    
                    <div className="glass-panel p-6 space-y-2">
                      <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">
                        {item.duration}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {item.role}
                      </h3>
                      <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {item.company}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education timeline */}
            <div>
              <div className="flex items-center gap-3 mb-12">
                <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
                  <BookOpen size={22} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Education</h2>
              </div>

              <div className="relative border-l-2 border-purple-500/20 ml-4 pl-8 space-y-12">
                {education.map((item) => (
                  <div key={item.id} className="relative">
                    {/* Circle marker */}
                    <span className="absolute -left-12 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-dark-bg border-4 border-purple-500 flex items-center justify-center shadow-md shadow-purple-500/20" />

                    <div className="glass-panel p-6 space-y-2">
                      <span className="text-xs font-bold text-purple-500 dark:text-purple-400">
                        {item.duration}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {item.degree}
                      </h3>
                      <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {item.school}
                      </h4>
                      <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        Grade: {item.grade}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. PROJECTS SECTION */}
      <section id="projects" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Projects</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Featured AI models, deep learning networks, and software applications.</p>
            <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full" />
          </div>

          {/* Filtering buttons */}
          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {projectCategories.map((cat) => (
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

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((p) => (
              <div key={p.id} className="glass-panel overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                {/* Project Image Panel */}
                <div className="h-48 w-full bg-gradient-to-br from-indigo-950 to-slate-900 relative flex items-center justify-center p-6 border-b border-slate-100 dark:border-slate-800">
                  {p.image ? (
                    <img src={resolveAssetUrl(p.image)} alt={p.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center space-y-1">
                      <Terminal className="text-indigo-400 mx-auto animate-float" size={40} />
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {p.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1">
                    {p.tech.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setActiveProjectModal(p)}
                      className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                      Case Study <ChevronRight size={14} />
                    </button>

                    <div className="flex space-x-2">
                      {p.github && (
                        <a
                          href={p.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                          title="GitHub Source"
                        >
                          <Github size={16} />
                        </a>
                      )}
                      {p.demo && (
                        <a
                          href={p.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                          title="Live Demo"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CERTIFICATIONS & ACHIEVEMENTS */}
      <section id="certifications" className="py-20 bg-slate-50/50 dark:bg-dark-bg/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Certifications Card list */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Award size={22} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Certifications</h2>
              </div>

              <div className="space-y-4">
                {certifications.map((cert) => (
                  <div key={cert.id} className="glass-panel p-5 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{cert.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Issued by {cert.issuer} • {cert.date}
                      </p>
                    </div>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements Card list */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <ShieldCheck size={22} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Key Achievements</h2>
              </div>

              <div className="space-y-4">
                {achievements.map((ach) => (
                  <div key={ach.id} className="glass-panel p-5 flex items-center space-x-4">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {ach.title}
                      </h3>
                      <p className="text-xs font-semibold text-indigo-500 mt-0.5">
                        {ach.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. LIVE CODING PROFILES INTEGRATION */}
      <section id="coding-profiles" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Coding Profiles</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Live metrics and rankings retrieved automatically from competitive coding platforms.</p>
            <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* GitHub Profile Card */}
            {profile.socials.github && (
              <div className="glass-panel p-6 flex flex-col justify-between hover:scale-102 transition-transform duration-300 border-t-4 border-t-slate-800">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">GitHub</h3>
                    <Github size={24} className="text-slate-800 dark:text-slate-400" />
                  </div>
                  
                  {codingStats.github.loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  ) : codingStats.github.data ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img src={codingStats.github.data.avatarUrl} alt="github" className="w-10 h-10 rounded-full border border-slate-700" />
                        <div>
                          <p className="text-sm font-bold text-slate-950 dark:text-slate-100">{codingStats.github.data.username}</p>
                          <p className="text-[10px] text-slate-500">{codingStats.github.data.bio || 'Developer'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center pt-2">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{codingStats.github.data.publicRepos}</p>
                          <p className="text-[9px] text-slate-500 font-semibold uppercase">Repos</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{codingStats.github.data.totalStars}</p>
                          <p className="text-[9px] text-slate-500 font-semibold uppercase">Stars</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{codingStats.github.data.followers}</p>
                          <p className="text-[9px] text-slate-500 font-semibold uppercase">Followers</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Failed to load statistics or profile not connected.</p>
                  )}
                </div>
                
                <a
                  href={profile.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full text-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                >
                  Visit Profile <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* LeetCode Profile Card */}
            {profile.socials.leetcode && (
              <div className="glass-panel p-6 flex flex-col justify-between hover:scale-102 transition-transform duration-300 border-t-4 border-t-amber-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">LeetCode</h3>
                    <span className="text-amber-500 font-extrabold text-sm">LC</span>
                  </div>

                  {codingStats.leetcode.loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  ) : codingStats.leetcode.data && !codingStats.leetcode.data.error ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span>Username:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">{codingStats.leetcode.data.username}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                        <span>Global Rank:</span>
                        <span className="text-indigo-500 font-bold">#{codingStats.leetcode.data.ranking ? parseInt(codingStats.leetcode.data.ranking).toLocaleString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                        <span>Rating:</span>
                        <span className="text-amber-500 font-bold">
                          {codingStats.leetcode.data.contestRating ? Number(codingStats.leetcode.data.contestRating).toFixed(0) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                        <span>Contests:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">
                          {codingStats.leetcode.data.contestsParticipated ?? 'N/A'}
                        </span>
                      </div>

                      <div className="pt-2">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Solved Problems:</span>
                          <span>{codingStats.leetcode.data.totalSolved || 0}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold text-white">
                          <div className="bg-emerald-500/20 text-emerald-500 py-1.5 rounded border border-emerald-500/10">
                            <span className="block text-xs font-black">{codingStats.leetcode.data.easySolved || 0}</span>
                            Easy
                          </div>
                          <div className="bg-amber-500/20 text-amber-500 py-1.5 rounded border border-amber-500/10">
                            <span className="block text-xs font-black">{codingStats.leetcode.data.mediumSolved || 0}</span>
                            Med
                          </div>
                          <div className="bg-rose-500/20 text-rose-500 py-1.5 rounded border border-rose-500/10">
                            <span className="block text-xs font-black">{codingStats.leetcode.data.hardSolved || 0}</span>
                            Hard
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Failed to load statistics or profile not connected.</p>
                  )}
                </div>

                <a
                  href={profile.socials.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full text-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                >
                  Visit Profile <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* CodeChef Profile Card */}
            {profile.socials.codechef && (
              <div className="glass-panel p-6 flex flex-col justify-between hover:scale-102 transition-transform duration-300 border-t-4 border-t-indigo-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">CodeChef</h3>
                    <span className="px-2 py-0.5 rounded bg-indigo-500 text-white font-extrabold text-[10px]">CC</span>
                  </div>

                  {codingStats.codechef.loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  ) : codingStats.codechef.data && !codingStats.codechef.data.error ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span>Stars:</span>
                        <span className="text-indigo-500 font-extrabold text-sm">{codingStats.codechef.data.stars}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-semibold">Rating</p>
                          <p className="text-lg font-black text-slate-800 dark:text-slate-200">{codingStats.codechef.data.rating}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-semibold">Max Rating</p>
                          <p className="text-lg font-black text-slate-500">{codingStats.codechef.data.highestRating}</p>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>Global Rank:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{codingStats.codechef.data.globalRank}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Country Rank:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{codingStats.codechef.data.countryRank}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>Problems Solved:</span>
                        <span className="font-bold text-emerald-500">{codingStats.codechef.data.problemsSolved ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Contests:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{codingStats.codechef.data.contestsParticipated ?? 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Failed to load statistics or profile not connected.</p>
                  )}
                </div>

                <a
                  href={profile.socials.codechef}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full text-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                >
                  Visit Profile <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Codeforces Profile Card */}
            {profile.socials.codeforces && (
              <div className="glass-panel p-6 flex flex-col justify-between hover:scale-102 transition-transform duration-300 border-t-4 border-t-rose-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Codeforces</h3>
                    <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-extrabold text-[10px]">CF</span>
                  </div>
                  {codingStats.codeforces.loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  ) : codingStats.codeforces.data && !codingStats.codeforces.data.error ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span>Rating:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{codingStats.codeforces.data.rating || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Max Rating:</span>
                        <span className="font-bold text-rose-500">{codingStats.codeforces.data.maxRating || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Rank:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{codingStats.codeforces.data.rank || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Contests:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{codingStats.codeforces.data.contestsParticipated ?? 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Failed to load statistics or profile not connected.</p>
                  )}
                </div>
                <a
                  href={profile.socials.codeforces}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full text-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                >
                  Visit Profile <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* HackerRank Profile Card */}
            {profile.socials.hackerrank && (
              <div className="glass-panel p-6 flex flex-col justify-between hover:scale-102 transition-transform duration-300 border-t-4 border-t-emerald-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">HackerRank</h3>
                    <span className="text-emerald-500 font-extrabold text-sm">HR</span>
                  </div>

                  {codingStats.hackerrank.loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    </div>
                  ) : codingStats.hackerrank.data ? (
                    <div className="space-y-3 text-xs text-slate-500 font-semibold">
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span>Username:</span>
                        <span className="text-slate-950 dark:text-slate-100 font-bold">{codingStats.hackerrank.data.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Problem Solving:</span>
                        <span className="text-amber-500">★★★★★</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Python Skill:</span>
                        <span className="text-amber-500">★★★★★</span>
                      </div>
                      <div className="flex justify-between">
                        <span>C++ Skill:</span>
                        <span className="text-amber-500">★★★★☆</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Profile connected.</p>
                  )}
                </div>

                <a
                  href={profile.socials.hackerrank}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full text-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                >
                  Visit Profile <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Smart Interviews Card */}
            {profile.socials.smartinterviews && (
              <div className="glass-panel p-6 flex flex-col justify-between hover:scale-102 transition-transform duration-300 border-t-4 border-t-purple-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Smart Interviews</h3>
                    <span className="px-2 py-0.5 rounded bg-purple-500 text-white font-extrabold text-[10px]">SI</span>
                  </div>

                  {codingStats.smartinterviews.loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    </div>
                  ) : codingStats.smartinterviews.data ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span>Username:</span>
                        <span className="text-slate-950 dark:text-slate-100 font-bold">{codingStats.smartinterviews.data.username}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Global Rank:</span>
                        <span className="text-indigo-500 font-bold text-sm">#{codingStats.smartinterviews.data.globalRank || '7912'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium">Profile connected.</p>
                  )}
                </div>

                <a
                  href={profile.socials.smartinterviews}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full text-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                >
                  Visit Profile <ExternalLink size={12} />
                </a>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 8. CONTACT SECTION */}
      <section id="contact" className="py-20 bg-slate-50/50 dark:bg-dark-bg/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-2 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Contact Me</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Get in touch! Fill out the form or reach me via social links.</p>
            <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Contact Details Panel */}
            <div className="lg:col-span-4 glass-panel p-8 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Contact Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 text-xs">
                    <Mail size={18} className="text-indigo-500 flex-shrink-0" />
                    <a href={`mailto:${profile.email}`} className="hover:text-indigo-500 transition-colors">
                      {profile.email}
                    </a>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 text-xs">
                      <Phone size={18} className="text-indigo-500 flex-shrink-0" />
                      <a href={`tel:${profile.phone}`} className="hover:text-indigo-500 transition-colors">
                        {profile.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 text-xs">
                    <MessageCircle size={18} className="text-indigo-500 flex-shrink-0" />
                    <a href="https://wa.me/919063452001" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">
                      WhatsApp: +91 9063452001
                    </a>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 text-xs">
                    <MapPin size={18} className="text-indigo-500 flex-shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                </div>
              </div>

              {/* Social Links Block */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Follow Me</h4>
                <div className="flex space-x-2">
                  <a
                    href={profile.socials.linkedin || 'https://linkedin.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-500 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 transition-colors"
                  >
                    <Linkedin size={16} />
                  </a>
                  <a
                    href={profile.socials.github || 'https://github.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-800 hover:text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 transition-colors"
                  >
                    <Github size={16} />
                  </a>
                  <a
                    href="https://instagram.com/prade._.p"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-pink-50 hover:bg-pink-500 hover:text-white dark:bg-slate-800 dark:hover:bg-pink-600 text-pink-600 dark:text-pink-400 transition-colors"
                  >
                    <Instagram size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form Panel */}
            <div className="lg:col-span-8 glass-panel p-8">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full glass-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full glass-input"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Internship Inquiry / Partnership"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full glass-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your message here..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full glass-input resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    disabled={formStatus.submitting}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-all hover:scale-102 active:scale-98 shadow-md shadow-indigo-600/15"
                  >
                    {formStatus.submitting ? 'Sending...' : 'Send Message'}
                    <Send size={16} />
                  </button>

                  {/* Feedback status */}
                  {formStatus.success && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-scale-up">
                      <CheckCircle size={14} /> Message sent successfully!
                    </span>
                  )}
                  {formStatus.error && (
                    <span className="text-xs font-bold text-rose-500 animate-scale-up">
                      {formStatus.error}
                    </span>
                  )}
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* 9. CASE STUDY / DETAILS MODAL */}
      {activeProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl glass-panel max-h-[90vh] overflow-y-auto border p-6 sm:p-8 space-y-6 relative animate-scale-up shadow-2xl bg-white dark:bg-dark-card">
            
            {/* Close */}
            <button
              onClick={() => setActiveProjectModal(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300"
            >
              <X size={16} />
            </button>

            {/* Head */}
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                {activeProjectModal.category}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {activeProjectModal.title}
              </h3>
            </div>

            {/* Project Image block in modal */}
            {activeProjectModal.image && (
              <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                <img src={resolveAssetUrl(activeProjectModal.image)} alt="project cover" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Description */}
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">Project Overview</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeProjectModal.description}
                </p>
              </div>

              {/* Key Features */}
              {activeProjectModal.features && activeProjectModal.features.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Key Features</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    {activeProjectModal.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle size={14} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technologies */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Built With</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeProjectModal.tech.map((t) => (
                    <span key={t} className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              {activeProjectModal.github && (
                <a
                  href={activeProjectModal.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <Github size={14} /> Source Code
                </a>
              )}
              {activeProjectModal.demo && (
                <a
                  href={activeProjectModal.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/10"
                >
                  <ExternalLink size={14} /> Live Demo
                </a>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
