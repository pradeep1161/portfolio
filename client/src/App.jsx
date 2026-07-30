import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import AIChatbot from './components/AIChatbot';
import PublicPortfolio from './pages/PublicPortfolio';
import BlogSection from './pages/BlogSection';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import { AuthProvider, useAuth, API_BASE_URL } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function MainAppContent() {
  const [currentView, setCurrentView] = useState('portfolio'); // 'portfolio', 'blog', 'login', 'admin'
  const [activeSection, setActiveSection] = useState('hero');
  const [portfolio, setPortfolio] = useState(null);
  const [visitorCount, setVisitorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchPortfolio = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/portfolio`);
      setPortfolio(res.data);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Protect admin route
  const resolvedView = currentView === 'admin' && !isAuthenticated ? 'login' : currentView;

  // Handle active scroll section highlighting
  useEffect(() => {
    if (currentView !== 'portfolio') return;

    const handleScroll = () => {
      const sections = ['hero', 'about', 'skills', 'experience', 'projects', 'certifications', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400 bg-[#0B0F19]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="animate-pulse font-semibold text-sm">Initializing Application...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden select-none">
      {/* Dynamic Animated Particles Background */}
      <ParticleBackground />

      {/* Floating Chat Assistant */}
      {resolvedView !== 'admin' && <AIChatbot />}

      {/* Navigation */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        currentView={resolvedView}
        setCurrentView={setCurrentView}
      />

      {/* Render Main Content Screen */}
      <div className="flex-grow">
        {resolvedView === 'portfolio' && (
          <PublicPortfolio
            portfolio={portfolio}
            setVisitorCount={setVisitorCount}
          />
        )}
        {resolvedView === 'blog' && <BlogSection />}
        {resolvedView === 'login' && <AdminLogin setCurrentView={setCurrentView} />}
        {resolvedView === 'admin' && (
          <AdminDashboard
            setCurrentView={setCurrentView}
            initialPortfolio={portfolio}
            onRefreshPortfolio={fetchPortfolio}
          />
        )}
      </div>

      {/* Footer (Hidden on Admin screen to maximize work area) */}
      {resolvedView !== 'admin' && (
        <Footer profile={portfolio?.profile} visitorCount={visitorCount} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
