import React, { useState } from 'react';
import { useAppState, AppProvider } from './store/AppContext';
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
  const { loading } = useAppState();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-cyan-500/50 animate-pulse font-mono text-[10px] uppercase tracking-[0.2em]">Inicializando Kernel...</p>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {(() => {
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
      })()}
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
