import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, User, FolderGit2, BookOpen, KeyRound, LogOut, 
  Trash2, Plus, Edit, Save, Upload, ShieldAlert, CheckCircle, 
  Eye, MessageSquare, Globe, FileDown, Layers, Award, ShieldCheck, PenTool, Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { API_BASE_URL } from '../context/AuthContext';

export default function AdminDashboard({ setCurrentView, initialPortfolio, onRefreshPortfolio }) {
  const { token, logout, updatePassword } = useAuth();
  
  // Dashboard view settings
  const [activeTab, setActiveTab] = useState('overview');

  // Portfolio local copy
  const [profileForm, setProfileForm] = useState(initialPortfolio?.profile || {});
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  // Lists copies
  const [education, setEducation] = useState(initialPortfolio?.education || []);
  const [skills, setSkills] = useState(initialPortfolio?.skills || []);
  const [experience, setExperience] = useState(initialPortfolio?.experience || []);
  const [projects, setProjects] = useState(initialPortfolio?.projects || []);
  const [certifications, setCertifications] = useState(initialPortfolio?.certifications || []);
  const [achievements, setAchievements] = useState(initialPortfolio?.achievements || []);

  // Analytics & Messages
  const [analytics, setAnalytics] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Blogs state
  const [blogs, setBlogs] = useState([]);
  const [blogForm, setBlogForm] = useState({ title: '', content: '', category: 'Machine Learning', tags: '' });
  const [editingBlogId, setEditingBlogId] = useState(null);

  // Status/Toast states
  const [saveStatus, setSaveStatus] = useState({ saving: false, success: false, error: null });
  const [secStatus, setSecStatus] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', updating: false, success: false, error: null });

  // Modal / Form helper states
  const [projectForm, setProjectForm] = useState({ title: '', description: '', category: 'AI & Deep Learning', github: '', demo: '', tech: '', features: '', image: '' });
  const [projectImageFile, setProjectImageFile] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);

  // Fetch Dashboard Stats and Messages
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const authHeader = { headers: { Authorization: `Bearer ${token}` } };
        const resStats = await axios.get(`${API_BASE_URL}/api/analytics`, authHeader);
        setAnalytics(resStats.data.analytics);

        const resMsg = await axios.get(`${API_BASE_URL}/api/analytics/messages`, authHeader);
        setMessages(resMsg.data);

        const resBlogs = await axios.get(`${API_BASE_URL}/api/blogs`);
        setBlogs(resBlogs.data);
      } catch (err) {
        console.error('Error loading analytics:', err);
      }
    };
    fetchStats();
  }, [token]);

  // Synchronize when initialPortfolio changes
  useEffect(() => {
    if (initialPortfolio) {
      setProfileForm(initialPortfolio.profile);
      setEducation(initialPortfolio.education);
      setSkills(initialPortfolio.skills);
      setExperience(initialPortfolio.experience);
      setProjects(initialPortfolio.projects);
      setCertifications(initialPortfolio.certifications);
      setAchievements(initialPortfolio.achievements);
    }
  }, [initialPortfolio]);

  const showConfetti = () => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
  };

  const handleLogout = () => {
    logout();
    setCurrentView('portfolio');
  };

  // --- SAVE PROFILE ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveStatus({ saving: true, success: false, error: null });

    try {
      const formData = new FormData();
      formData.append('profile', JSON.stringify(profileForm));
      if (avatarFile) formData.append('avatar', avatarFile);
      if (resumeFile) formData.append('resume', resumeFile);

      const res = await axios.put(`${API_BASE_URL}/api/portfolio/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfileForm(prev => ({ ...prev, ...res.data.data }));
      setSaveStatus({ saving: false, success: true, error: null });
      setAvatarFile(null);
      setResumeFile(null);
      showConfetti();
      onRefreshPortfolio();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving profile details';
      setSaveStatus({ saving: false, success: false, error: msg });
    }
  };

  // --- DELETE MESSAGE ---
  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/analytics/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.filter(m => m.id !== id && m._id !== id));
      showConfetti();
    } catch {
      alert('Delete failed');
    }
  };

  // --- GENERAL SAVER FOR SECTION LISTS ---
  const saveSectionList = async (apiEndpoint, listData, setListState) => {
    setSaveStatus({ saving: true, success: false, error: null });
    try {
      const fieldName = apiEndpoint.split('/').pop();
      const res = await axios.put(`${API_BASE_URL}${apiEndpoint}`, { [fieldName]: listData }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListState(res.data.data);
      setSaveStatus({ saving: false, success: true, error: null });
      showConfetti();
      onRefreshPortfolio();
    } catch (err) {
      setSaveStatus({ saving: false, success: false, error: err.response?.data?.message || 'Update failed' });
    }
  };

  // --- EDUCATION CRUD ---
  const handleAddEducation = () => {
    const newItem = {
      id: 'edu-' + Date.now(),
      degree: 'Degree Title',
      school: 'School Name',
      duration: '2024 - 2026',
      grade: '7.5 CGPA'
    };
    const updatedList = [...education, newItem];
    setEducation(updatedList);
    saveSectionList('/api/portfolio/education', updatedList, setEducation);
  };

  const handleEditEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const handleDeleteEducation = (index) => {
    const updated = education.filter((_, idx) => idx !== index);
    setEducation(updated);
    saveSectionList('/api/portfolio/education', updated, setEducation);
  };

  // --- SKILLS CRUD ---
  const handleAddSkill = () => {
    const newItem = {
      id: 'sk-' + Date.now(),
      name: 'New Skill',
      category: 'Web',
      level: 80
    };
    const updatedList = [...skills, newItem];
    setSkills(updatedList);
    saveSectionList('/api/portfolio/skills', updatedList, setSkills);
  };

  const handleEditSkill = (index, field, value) => {
    const updated = [...skills];
    updated[index][field] = value;
    setSkills(updated);
  };

  const handleDeleteSkill = (index) => {
    const updated = skills.filter((_, idx) => idx !== index);
    setSkills(updated);
    saveSectionList('/api/portfolio/skills', updated, setSkills);
  };

  // --- EXPERIENCE CRUD ---
  const handleAddExperience = () => {
    const newItem = {
      id: 'exp-' + Date.now(),
      company: 'Company Name',
      role: 'Internship / Fulltime',
      duration: 'Duration',
      description: 'Responsibilities...'
    };
    const updatedList = [...experience, newItem];
    setExperience(updatedList);
    saveSectionList('/api/portfolio/experience', updatedList, setExperience);
  };

  const handleEditExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  const handleDeleteExperience = (index) => {
    const updated = experience.filter((_, idx) => idx !== index);
    setExperience(updated);
    saveSectionList('/api/portfolio/experience', updated, setExperience);
  };

  // --- CERTIFICATIONS CRUD ---
  const handleAddCertification = () => {
    const newItem = {
      id: 'cert-' + Date.now(),
      title: 'New Certificate',
      issuer: 'Issuer',
      date: '2024',
      url: ''
    };
    const updatedList = [...certifications, newItem];
    setCertifications(updatedList);
    saveSectionList('/api/portfolio/certifications', updatedList, setCertifications);
  };

  const handleEditCertification = (index, field, value) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const handleDeleteCertification = (index) => {
    const updated = certifications.filter((_, idx) => idx !== index);
    setCertifications(updated);
    saveSectionList('/api/portfolio/certifications', updated, setCertifications);
  };

  // --- ACHIEVEMENTS CRUD ---
  const handleAddAchievement = () => {
    const newItem = {
      id: 'ach-' + Date.now(),
      title: 'Achievement Title',
      detail: 'Rank / Description'
    };
    const updatedList = [...achievements, newItem];
    setAchievements(updatedList);
    saveSectionList('/api/portfolio/achievements', updatedList, setAchievements);
  };

  const handleEditAchievement = (index, field, value) => {
    const updated = [...achievements];
    updated[index][field] = value;
    setAchievements(updated);
  };

  const handleDeleteAchievement = (index) => {
    const updated = achievements.filter((_, idx) => idx !== index);
    setAchievements(updated);
    saveSectionList('/api/portfolio/achievements', updated, setAchievements);
  };

  // --- PROJECT CRUD ---
  const handleSaveProject = async (e) => {
    e.preventDefault();
    setSaveStatus({ saving: true, success: false, error: null });

    try {
      let imageUrl = projectForm.image;

      // Check if project thumbnail file needs uploading first
      if (projectImageFile) {
        const imgData = new FormData();
        imgData.append('image', projectImageFile);
        const uploadRes = await axios.post(`${API_BASE_URL}/api/portfolio/projects/image`, imgData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadRes.data.url;
      }

      // Convert lists
      const techArray = projectForm.tech.split(',').map(s => s.trim()).filter(Boolean);
      const featuresArray = projectForm.features.split('\n').map(s => s.trim()).filter(Boolean);

      let updatedProjects = [...projects];

      if (editingProjectId) {
        // Edit existing project
        updatedProjects = updatedProjects.map(p => 
          p.id === editingProjectId 
            ? { ...p, ...projectForm, image: imageUrl, tech: techArray, features: featuresArray }
            : p
        );
      } else {
        // Create new project
        const newProj = {
          id: 'proj-' + Date.now(),
          title: projectForm.title,
          description: projectForm.description,
          category: projectForm.category,
          github: projectForm.github,
          demo: projectForm.demo,
          image: imageUrl,
          tech: techArray,
          features: featuresArray,
          screenshots: []
        };
        updatedProjects.push(newProj);
      }

      // Push updates
      const res = await axios.put(`${API_BASE_URL}/api/portfolio/projects`, { projects: updatedProjects }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProjects(res.data.data);
      setSaveStatus({ saving: false, success: true, error: null });
      setProjectForm({ title: '', description: '', category: 'AI & Deep Learning', github: '', demo: '', tech: '', features: '', image: '' });
      setProjectImageFile(null);
      setEditingProjectId(null);
      showConfetti();
      onRefreshPortfolio();
    } catch (err) {
      setSaveStatus({ saving: false, success: false, error: err.response?.data?.message || 'Error saving project' });
    }
  };

  const handleEditProjectClick = (p) => {
    setEditingProjectId(p.id);
    setProjectForm({
      title: p.title,
      description: p.description,
      category: p.category,
      github: p.github || '',
      demo: p.demo || '',
      tech: p.tech.join(', '),
      features: p.features.join('\n'),
      image: p.image || ''
    });
  };

  const handleDeleteProject = (id) => {
    if (!window.confirm('Delete this project?')) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveSectionList('/api/portfolio/projects', updated, setProjects);
  };

  // --- BLOGS CRUD ---
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    setSaveStatus({ saving: true, success: false, error: null });

    try {
      const tagsArray = blogForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const dataToSend = { ...blogForm, tags: tagsArray };

      if (editingBlogId) {
        // Update
        const res = await axios.put(`${API_BASE_URL}/api/blogs/${editingBlogId}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBlogs(prev => prev.map(b => (b.id === editingBlogId || b._id === editingBlogId) ? res.data.data : b));
      } else {
        // Create
        const res = await axios.post(`${API_BASE_URL}/api/blogs`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBlogs(prev => [res.data.data, ...prev]);
      }

      setSaveStatus({ saving: false, success: true, error: null });
      setBlogForm({ title: '', content: '', category: 'Machine Learning', tags: '' });
      setEditingBlogId(null);
      showConfetti();
    } catch (err) {
      setSaveStatus({ saving: false, success: false, error: err.response?.data?.message || 'Blog save failed' });
    }
  };

  const handleEditBlogClick = (b) => {
    setEditingBlogId(b.id || b._id);
    setBlogForm({
      title: b.title,
      content: b.content,
      category: b.category,
      tags: b.tags.join(', ')
    });
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(prev => prev.filter(b => b.id !== id && b._id !== id));
      showConfetti();
    } catch {
      alert('Delete failed');
    }
  };

  // --- SECURITY PASSWORD UPDATE ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSecStatus(prev => ({ ...prev, updating: true, success: false, error: null }));

    if (secStatus.newPassword !== secStatus.confirmPassword) {
      setSecStatus(prev => ({ ...prev, updating: false, error: "New passwords do not match!" }));
      return;
    }

    const res = await updatePassword(secStatus.currentPassword, secStatus.newPassword);
    if (res.success) {
      setSecStatus({ currentPassword: '', newPassword: '', confirmPassword: '', updating: false, success: true, error: null });
      showConfetti();
    } else {
      setSecStatus(prev => ({ ...prev, updating: false, error: res.error }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 flex flex-col md:flex-row gap-8">
      
      {/* Side Tabs navigation menu */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
        <div className="glass-panel p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Portfolio CMS
          </div>
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Overview & Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User size={18} />
            <span>Edit Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'sections'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers size={18} />
            <span>Manage Sections</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderGit2 size={18} />
            <span>Manage Projects</span>
          </button>

          <button
            onClick={() => setActiveTab('blogs')}
            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'blogs'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PenTool size={18} />
            <span>Manage Blogs</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <KeyRound size={18} />
            <span>Security Settings</span>
          </button>

          <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Tab Panel */}
      <main className="flex-1 min-w-0">
        
        {/* Save Status Toast/Banner */}
        {saveStatus.success && (
          <div className="mb-4 flex items-center space-x-2 p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold animate-scale-up">
            <CheckCircle size={16} />
            <span>Changes saved successfully!</span>
          </div>
        )}
        {saveStatus.error && (
          <div className="mb-4 flex items-center space-x-2 p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-semibold animate-shake">
            <ShieldAlert size={16} />
            <span>{saveStatus.error}</span>
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-scale-up">
            
            {/* Analytics Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass-panel p-6 flex items-center space-x-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Eye size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Profile Views</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{analytics?.totalViews || 0}</p>
                </div>
              </div>

              <div className="glass-panel p-6 flex items-center space-x-4">
                <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Visitor Messages</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{messages.length}</p>
                </div>
              </div>

              <div className="glass-panel p-6 flex items-center space-x-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <Globe size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Unique Countries</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {analytics?.countryViews ? Object.keys(analytics.countryViews).length : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Layout divided: Messages | Country lists */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Messages Review Panel */}
              <div className="lg:col-span-8 glass-panel p-6 space-y-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Inbox Messages</h3>
                
                {messages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-12">No messages received yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {messages.map((m) => (
                      <div key={m.id || m._id} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 relative">
                        <button
                          onClick={() => handleDeleteMessage(m.id || m._id)}
                          className="absolute top-4 right-4 p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
                          title="Delete Message"
                        >
                          <Trash2 size={14} />
                        </button>
                        
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</h4>
                          <p className="text-[10px] text-slate-500 font-semibold">{m.email} • {new Date(m.date).toLocaleDateString()}</p>
                        </div>
                        <p className="text-xs font-bold text-indigo-500">Subject: {m.subject}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 whitespace-pre-line">
                          {m.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Country & Projects view breakdown */}
              <div className="lg:col-span-4 space-y-8">
                <div className="glass-panel p-6 space-y-4">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Top Locations</h3>
                  <div className="space-y-3">
                    {analytics?.countryViews && Object.entries(analytics.countryViews).length > 0 ? (
                      Object.entries(analytics.countryViews)
                        .sort((a, b) => b[1] - a[1])
                        .map(([c, count]) => (
                          <div key={c} className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-600 dark:text-slate-300">{c}</span>
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-md font-bold">{count}</span>
                          </div>
                        ))
                    ) : (
                      <p className="text-[10px] text-slate-400">No geo data logged yet.</p>
                    )}
                  </div>
                </div>

                <div className="glass-panel p-6 space-y-4">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Project Interactivity</h3>
                  <div className="space-y-3">
                    {analytics?.projectViews && Object.entries(analytics.projectViews).length > 0 ? (
                      Object.entries(analytics.projectViews).map(([pId, count]) => {
                        const proj = projects.find(pr => pr.id === pId);
                        return (
                          <div key={pId} className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{proj ? proj.title : pId}</span>
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-md font-bold">{count}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[10px] text-slate-400">No project detail loads tracked yet.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB: EDIT PROFILE */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="glass-panel p-6 sm:p-8 space-y-6 animate-scale-up">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Profile Customizations</h3>
            
            {/* Header: Photo upload & Seeking internship */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              
              {/* Photo selector */}
              <div className="sm:col-span-6 flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                  {avatarFile ? (
                    <img src={URL.createObjectURL(avatarFile)} alt="avatar" className="w-full h-full object-cover" />
                  ) : profileForm.avatar ? (
                    <img src={profileForm.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-indigo-500" size={32} />
                  )}
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Profile Photo</label>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700">
                    <Upload size={12} />
                    <span>Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setAvatarFile(e.target.files[0])} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Resume selector */}
              <div className="sm:col-span-6 flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                  <FileDown className="text-purple-500" size={32} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Resume PDF</label>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700">
                    <Upload size={12} />
                    <span>Upload PDF</span>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => setResumeFile(e.target.files[0])} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

            </div>

            {/* Checkbox badge */}
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={profileForm.seekingInternship}
                onChange={(e) => setProfileForm({ ...profileForm, seekingInternship: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-800 rounded focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Display badge "Seeking AI/ML Internship Opportunities" on landing page
              </span>
            </label>

            {/* Text Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Professional Title</label>
                <input
                  type="text"
                  required
                  value={profileForm.title || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  className="w-full glass-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Subtitle / Tagline</label>
              <input
                type="text"
                required
                value={profileForm.subtitle || ''}
                onChange={(e) => setProfileForm({ ...profileForm, subtitle: e.target.value })}
                className="w-full glass-input"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Biography / About</label>
              <textarea
                rows={4}
                required
                value={profileForm.bio || ''}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full glass-input resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileForm.email || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Phone</label>
                <input
                  type="text"
                  value={profileForm.phone || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Location</label>
                <input
                  type="text"
                  required
                  value={profileForm.location || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  className="w-full glass-input"
                />
              </div>
            </div>

            {/* Social Profile URL Links */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Coding Profile & Social URLs</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">GitHub Link</label>
                  <input
                    type="url"
                    value={profileForm.socials?.github || ''}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      socials: { ...profileForm.socials, github: e.target.value }
                    })}
                    className="w-full glass-input"
                    placeholder="https://github.com/username"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">LinkedIn Link</label>
                  <input
                    type="url"
                    value={profileForm.socials?.linkedin || ''}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      socials: { ...profileForm.socials, linkedin: e.target.value }
                    })}
                    className="w-full glass-input"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">LeetCode Link</label>
                  <input
                    type="url"
                    value={profileForm.socials?.leetcode || ''}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      socials: { ...profileForm.socials, leetcode: e.target.value }
                    })}
                    className="w-full glass-input"
                    placeholder="https://leetcode.com/username"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">CodeChef Link</label>
                  <input
                    type="url"
                    value={profileForm.socials?.codechef || ''}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      socials: { ...profileForm.socials, codechef: e.target.value }
                    })}
                    className="w-full glass-input"
                    placeholder="https://www.codechef.com/users/username"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Codeforces Link</label>
                  <input
                    type="url"
                    value={profileForm.socials?.codeforces || ''}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      socials: { ...profileForm.socials, codeforces: e.target.value }
                    })}
                    className="w-full glass-input"
                    placeholder="https://codeforces.com/profile/username"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">HackerRank Link</label>
                  <input
                    type="url"
                    value={profileForm.socials?.hackerrank || ''}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      socials: { ...profileForm.socials, hackerrank: e.target.value }
                    })}
                    className="w-full glass-input"
                    placeholder="https://www.hackerrank.com/username"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Smart Interviews Link</label>
                  <input
                    type="url"
                    value={profileForm.socials?.smartinterviews || ''}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      socials: { ...profileForm.socials, smartinterviews: e.target.value }
                    })}
                    className="w-full glass-input"
                    placeholder="https://smartinterviews.in/profile/username"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saveStatus.saving}
              className="flex items-center gap-1.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/10 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saveStatus.saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        )}

        {/* TAB: SECTIONS */}
        {activeTab === 'sections' && (
          <div className="space-y-12 animate-scale-up">
            
            {/* Manage Education list */}
            <div className="glass-panel p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="text-indigo-500" size={20} />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Education History</h3>
                </div>
                <button
                  onClick={handleAddEducation}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              <div className="space-y-6">
                {education.map((edu, idx) => (
                  <div key={edu.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                    <button
                      onClick={() => handleDeleteEducation(idx)}
                      className="absolute top-4 right-4 p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <div className="space-y-3 sm:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleEditEducation(idx, 'degree', e.target.value)}
                            className="w-full glass-input text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">School/University</label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => handleEditEducation(idx, 'school', e.target.value)}
                            className="w-full glass-input text-xs"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Duration</label>
                          <input
                            type="text"
                            value={edu.duration}
                            onChange={(e) => handleEditEducation(idx, 'duration', e.target.value)}
                            className="w-full glass-input text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Grade / CGPA</label>
                          <input
                            type="text"
                            value={edu.grade}
                            onChange={(e) => handleEditEducation(idx, 'grade', e.target.value)}
                            className="w-full glass-input text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {education.length > 0 && (
                <button
                  onClick={() => saveSectionList('/api/portfolio/education', education, setEducation)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow"
                >
                  <Save size={14} /> Save Education List
                </button>
              )}
            </div>

            {/* Manage Skills list */}
            <div className="glass-panel p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Layers className="text-pink-500" size={20} />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Skills Matrix</h3>
                </div>
                <button
                  onClick={handleAddSkill}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
                >
                  <Plus size={14} /> Add Skill
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skills.map((sk, idx) => (
                  <div key={sk.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex-1 grid grid-cols-12 gap-2">
                      <input
                        type="text"
                        value={sk.name}
                        onChange={(e) => handleEditSkill(idx, 'name', e.target.value)}
                        className="col-span-5 bg-transparent border-b border-transparent focus:border-indigo-500 text-xs font-semibold py-1 focus:outline-none text-slate-800 dark:text-slate-200"
                      />
                      
                      <select
                        value={sk.category}
                        onChange={(e) => handleEditSkill(idx, 'category', e.target.value)}
                        className="col-span-4 bg-transparent text-[10px] focus:outline-none text-slate-500"
                      >
                        <option value="Programming">Programming</option>
                        <option value="Web">Web</option>
                        <option value="Database">Database</option>
                        <option value="Machine Learning">Machine Learning</option>
                        <option value="CS Fundamentals">CS Fundamentals</option>
                        <option value="Tools">Tools</option>
                      </select>

                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sk.level}
                        onChange={(e) => handleEditSkill(idx, 'level', parseInt(e.target.value) || 0)}
                        className="col-span-3 bg-transparent border-b border-transparent focus:border-indigo-500 text-xs text-right py-1 focus:outline-none text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <button
                      onClick={() => handleDeleteSkill(idx)}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {skills.length > 0 && (
                <button
                  onClick={() => saveSectionList('/api/portfolio/skills', skills, setSkills)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow"
                >
                  <Save size={14} /> Save Skills Matrix
                </button>
              )}
            </div>

            {/* Manage Experience list */}
            <div className="glass-panel p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Briefcase className="text-purple-500" size={20} />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Experience Timeline</h3>
                </div>
                <button
                  onClick={handleAddExperience}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
                >
                  <Plus size={14} /> Add Entry
                </button>
              </div>

              <div className="space-y-6">
                {experience.map((exp, idx) => (
                  <div key={exp.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3 relative">
                    <button
                      onClick={() => handleDeleteExperience(idx)}
                      className="absolute top-4 right-4 p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Role / Position</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleEditExperience(idx, 'role', e.target.value)}
                          className="w-full glass-input text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Company Name</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleEditExperience(idx, 'company', e.target.value)}
                          className="w-full glass-input text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => handleEditExperience(idx, 'duration', e.target.value)}
                        className="w-full glass-input text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Description / Details</label>
                      <textarea
                        rows={3}
                        value={exp.description}
                        onChange={(e) => handleEditExperience(idx, 'description', e.target.value)}
                        className="w-full glass-input text-xs resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {experience.length > 0 && (
                <button
                  onClick={() => saveSectionList('/api/portfolio/experience', experience, setExperience)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow"
                >
                  <Save size={14} /> Save Experience Timeline
                </button>
              )}
            </div>

            {/* Certifications and Achievements list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="glass-panel p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Award className="text-amber-500" size={20} />
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Certifications</h3>
                  </div>
                  <button
                    onClick={handleAddCertification}
                    className="p-1 text-indigo-500 hover:bg-indigo-500/10 rounded"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {certifications.map((c, idx) => (
                    <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 relative">
                      <button
                        onClick={() => handleDeleteCertification(idx)}
                        className="absolute top-2 right-2 text-rose-500 hover:bg-rose-500/10 p-1 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                      <input
                        type="text"
                        placeholder="Title"
                        value={c.title}
                        onChange={(e) => handleEditCertification(idx, 'title', e.target.value)}
                        className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 text-xs font-bold focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Issuer"
                          value={c.issuer}
                          onChange={(e) => handleEditCertification(idx, 'issuer', e.target.value)}
                          className="bg-transparent border-b border-transparent focus:border-indigo-500 text-[10px] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Date"
                          value={c.date}
                          onChange={(e) => handleEditCertification(idx, 'date', e.target.value)}
                          className="bg-transparent border-b border-transparent focus:border-indigo-500 text-[10px] text-right focus:outline-none"
                        />
                      </div>
                      <input
                        type="url"
                        placeholder="Credential URL"
                        value={c.url}
                        onChange={(e) => handleEditCertification(idx, 'url', e.target.value)}
                        className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 text-[10px] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                {certifications.length > 0 && (
                  <button
                    onClick={() => saveSectionList('/api/portfolio/certifications', certifications, setCertifications)}
                    className="w-full text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
                  >
                    Save Certifications
                  </button>
                )}
              </div>

              <div className="glass-panel p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="text-emerald-500" size={20} />
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Achievements</h3>
                  </div>
                  <button
                    onClick={handleAddAchievement}
                    className="p-1 text-indigo-500 hover:bg-indigo-500/10 rounded"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {achievements.map((a, idx) => (
                    <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 relative">
                      <button
                        onClick={() => handleDeleteAchievement(idx)}
                        className="absolute top-2 right-2 text-rose-500 hover:bg-rose-500/10 p-1 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                      <input
                        type="text"
                        placeholder="Achievement Title"
                        value={a.title}
                        onChange={(e) => handleEditAchievement(idx, 'title', e.target.value)}
                        className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 text-xs font-bold focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Details / Rank"
                        value={a.detail}
                        onChange={(e) => handleEditAchievement(idx, 'detail', e.target.value)}
                        className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 text-[10px] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                {achievements.length > 0 && (
                  <button
                    onClick={() => saveSectionList('/api/portfolio/achievements', achievements, setAchievements)}
                    className="w-full text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
                  >
                    Save Achievements
                  </button>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB: MANAGE PROJECTS */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-scale-up">
            
            {/* Editor form panel */}
            <form onSubmit={handleSaveProject} className="lg:col-span-7 glass-panel p-6 space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                {editingProjectId ? 'Edit Project' : 'Create Project'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Title</label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="w-full glass-input text-xs"
                    placeholder="Project Name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Category</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full glass-input text-xs"
                  >
                    <option value="AI & Deep Learning">AI & Deep Learning</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Backend Development">Backend Development</option>
                    <option value="Full Stack Development">Full Stack Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Data Analytics">Data Analytics</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="IoT">IoT</option>
                    <option value="Game Development">Game Development</option>
                    <option value="Automation & Scripting">Automation & Scripting</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Overview Description</label>
                <textarea
                  rows={3}
                  required
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full glass-input text-xs resize-none"
                  placeholder="Summary of what the project accomplishes..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">GitHub Link</label>
                  <input
                    type="url"
                    value={projectForm.github}
                    onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })}
                    className="w-full glass-input text-xs"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Live Demo Link</label>
                  <input
                    type="url"
                    value={projectForm.demo}
                    onChange={(e) => setProjectForm({ ...projectForm, demo: e.target.value })}
                    className="w-full glass-input text-xs"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  required
                  value={projectForm.tech}
                  onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                  className="w-full glass-input text-xs"
                  placeholder="Python, TensorFlow, React, Flask"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Key Features (one per line)</label>
                <textarea
                  rows={3}
                  value={projectForm.features}
                  onChange={(e) => setProjectForm({ ...projectForm, features: e.target.value })}
                  className="w-full glass-input text-xs resize-none"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              {/* Cover Image uploader */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Project Cover Image</label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700">
                    <Upload size={12} />
                    <span>Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setProjectImageFile(e.target.files[0])} 
                      className="hidden" 
                    />
                  </label>
                  {projectImageFile && (
                    <span className="text-[10px] text-slate-500 font-bold truncate max-w-[150px]">{projectImageFile.name}</span>
                  )}
                  {!projectImageFile && projectForm.image && (
                    <span className="text-[10px] text-indigo-500 font-bold truncate max-w-[150px]">Using current cover</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saveStatus.saving}
                  className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow disabled:opacity-50"
                >
                  <Save size={14} />
                  {saveStatus.saving ? 'Saving...' : 'Save Project'}
                </button>
                {editingProjectId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProjectId(null);
                      setProjectForm({ title: '', description: '', category: 'AI & Deep Learning', github: '', demo: '', tech: '', features: '', image: '' });
                    }}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            {/* List panel */}
            <div className="lg:col-span-5 glass-panel p-6 space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Current Projects
              </h3>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {projects.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="space-y-1 max-w-[70%]">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{p.title}</h4>
                      <p className="text-[9px] uppercase font-bold text-indigo-500 tracking-wider">{p.category}</p>
                    </div>

                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => handleEditProjectClick(p)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-500/10 rounded"
                        title="Edit Project"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded"
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB: MANAGE BLOGS */}
        {activeTab === 'blogs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-scale-up">
            
            {/* Editor form panel */}
            <form onSubmit={handleSaveBlog} className="lg:col-span-8 glass-panel p-6 space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                {editingBlogId ? 'Edit Article' : 'Publish Article'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Title</label>
                  <input
                    type="text"
                    required
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    className="w-full glass-input text-xs"
                    placeholder="Article Title"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Category</label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="w-full glass-input text-xs"
                  >
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="AI">AI</option>
                    <option value="Python">Python</option>
                    <option value="Competitive Programming">Competitive Programming</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Backend Development">Backend Development</option>
                    <option value="Full Stack Development">Full Stack Development</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                    <option value="System Design">System Design</option>
                    <option value="Database">Database</option>
                    <option value="Career & Interview Prep">Career & Interview Prep</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tags (comma separated)</label>
                <input
                  type="text"
                  value={blogForm.tags}
                  onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                  className="w-full glass-input text-xs"
                  placeholder="tutorial, neuralnetworks, python"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Article Content</label>
                <textarea
                  rows={8}
                  required
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  className="w-full glass-input text-xs resize-none"
                  placeholder="Write post content here..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saveStatus.saving}
                  className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow disabled:opacity-50"
                >
                  <Save size={14} />
                  {saveStatus.saving ? 'Publishing...' : 'Publish'}
                </button>
                {editingBlogId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBlogId(null);
                      setBlogForm({ title: '', content: '', category: 'Machine Learning', tags: '' });
                    }}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            {/* List panel */}
            <div className="lg:col-span-4 glass-panel p-6 space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Articles
              </h3>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {blogs.map((b) => (
                  <div key={b.id || b._id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="space-y-1 max-w-[70%]">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{b.title}</h4>
                      <p className="text-[9px] uppercase font-bold text-indigo-500 tracking-wider">{b.category}</p>
                    </div>

                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => handleEditBlogClick(b)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-500/10 rounded"
                        title="Edit Article"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(b.id || b._id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded"
                        title="Delete Article"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB: SECURITY SETTINGS */}
        {activeTab === 'security' && (
          <form onSubmit={handleUpdatePassword} className="glass-panel p-6 sm:p-8 space-y-4 max-w-md animate-scale-up">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Change Credentials Password
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Current Password</label>
              <input
                type="password"
                required
                value={secStatus.currentPassword}
                onChange={(e) => setSecStatus({ ...secStatus, currentPassword: e.target.value })}
                className="w-full glass-input text-xs"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">New Password</label>
              <input
                type="password"
                required
                value={secStatus.newPassword}
                onChange={(e) => setSecStatus({ ...secStatus, newPassword: e.target.value })}
                className="w-full glass-input text-xs"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Confirm New Password</label>
              <input
                type="password"
                required
                value={secStatus.confirmPassword}
                onChange={(e) => setSecStatus({ ...secStatus, confirmPassword: e.target.value })}
                className="w-full glass-input text-xs"
                placeholder="••••••••"
              />
            </div>

            {secStatus.success && (
              <div className="flex items-center space-x-2 p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold">
                <CheckCircle size={14} />
                <span>Password updated successfully!</span>
              </div>
            )}
            {secStatus.error && (
              <div className="flex items-center space-x-2 p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-semibold">
                <ShieldAlert size={14} />
                <span>{secStatus.error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={secStatus.updating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow disabled:opacity-50 text-xs"
            >
              {secStatus.updating ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

      </main>
    </div>
  );
}
