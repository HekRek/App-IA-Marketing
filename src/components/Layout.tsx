
import React from 'react';
import { 
  BarChart3, 
  Users, 
  Search, 
  Megaphone, 
  Calendar, 
  Calculator, 
  History, 
  ShieldCheck, 
  UserCircle,
  LayoutDashboard,
  SearchCode,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'Propietario', icon: UserCircle },
  { id: 'analysis', label: 'Competencia & Estrategia', icon: SearchCode },
  { id: 'icp', label: 'Cliente Objetivo (ICP)', icon: ShieldCheck },
  { id: 'leads', label: 'Buscador de Leads', icon: Search },
  { id: 'marketing', label: 'Generador Marketing', icon: Megaphone },
  { id: 'social', label: 'Automatización RRSS', icon: Calendar },
  { id: 'roi', label: 'ROI & Métricas', icon: Calculator },
  { id: 'reports', label: 'Reportes y Precisión', icon: History },
  { id: 'mcp', label: 'Nexus API / MCP', icon: Terminal },
  { id: 'help', label: 'Ayuda', icon: HelpCircle },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 h-screen bg-black/40 backdrop-blur-xl text-slate-400 border-r border-white/10 flex flex-col p-4 fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          <BarChart3 className="w-5 h-5 text-black" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">AI-MARKETER.OS</h1>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Creado por Héctor Martín</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2 ml-2">Gestión Principal</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive 
                   ? 'bg-white/10 border border-white/10 text-white shadow-sm' 
                   : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-white/5 px-2">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Estado de Red</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
            <span className="text-[10px] text-cyan-400 opacity-80 uppercase tracking-tighter">Gemini-3-Flash Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode, activeTab: string, setActiveTab: (t: string) => void }> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto bg-[radial-gradient(circle_at_50%_-20%,#1e293b,transparent)] min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
