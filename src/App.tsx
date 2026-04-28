import React, { useState } from 'react';
import { useAppState, AppProvider } from './store/AppContext';
import { LayoutDashboard } from 'lucide-react';
import { Layout } from './components/Layout';
import { 
  Dashboard, 
  ProfileManager, 
  MarketAnalysis, 
  ICPGenerator, 
  LeadSearch, 
  MarketingGenerator, 
  SocialAutomation, 
  ROIHub, 
  ReportsTracker,
  MCPPanel,
  Documentation
} from './components/Modules';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading, loginWithGoogle } = useAppState();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-cyan-500/50 animate-pulse font-mono text-[10px] uppercase tracking-[0.2em]">Inicializando Kernel...</p>
      </div>
    );
  }

  const renderModule = () => {
    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-3xl flex items-center justify-center border border-cyan-500/30 animate-pulse">
            <LayoutDashboard className="w-10 h-10 text-cyan-400" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">Nexus AI Marketer</h2>
            <p className="text-slate-400 max-w-md mx-auto">Inicia sesión para acceder a tu panel estratégico de marketing y automatización.</p>
          </div>
          <button
            onClick={loginWithGoogle}
            className="group relative px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl overflow-hidden hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform" />
            <span className="relative group-hover:text-black transition-colors">Empezar ahora →</span>
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'profile': return <ProfileManager />;
      case 'analysis': return <MarketAnalysis />;
      case 'icp': return <ICPGenerator />;
      case 'leads': return <LeadSearch />;
      case 'marketing': return <MarketingGenerator />;
      case 'social': return <SocialAutomation />;
      case 'roi': return <ROIHub />;
      case 'reports': return <ReportsTracker />;
      case 'mcp': return <MCPPanel />;
      case 'help': return <Documentation />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderModule()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
