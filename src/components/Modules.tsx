
import React, { useState } from 'react';
import { useAppState } from '../store/AppContext';
import { geminiService } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { exportToCSV, exportToPDF } from '../lib/exportUtils';
import { 
  Plus, 
  Trash2, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Mail,
  Type,
  Layout as LayoutIcon,
  Image as ImageIcon,
  Search,
  Globe,
  MapPin,
  X,
  Edit3,
  Target,
  ShieldCheck,
  FileText,
  Phone,
  Megaphone,
  Terminal,
  Sparkles,
  Download,
  AlertTriangle,
  Bell,
  PieChart as PieChartIcon,
  BarChart3,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Lead, OwnerProfile, Competitor, ICP, MarketingCampaign, SocialPost, SocialPlatform, SocialStatus, ROIReport } from '../types';

// --- Dashboard Module ---
export const Dashboard = () => {
  const { profile, leads, roiHistory, logs, icp, competitors } = useAppState();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const latestROI = roiHistory[0];
  
  const leadsData = React.useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const counts: Record<string, number> = {};
    
    leads.forEach(l => {
      const date = new Date(l.addedAt);
      const month = months[date.getMonth()];
      counts[month] = (counts[month] || 0) + 1;
    });

    return months.map(m => ({ name: m, leads: counts[m] || 0 }));
  }, [leads]);

  const sectorData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      counts[l.sector] = (counts[l.sector] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const roiTrendData = React.useMemo(() => {
    return [...roiHistory].reverse().map(r => ({
      date: new Date(r.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      roi: r.roiPercentage
    }));
  }, [roiHistory]);

  const COLORS = ['#06b6d4', '#22d3ee', '#164e63', '#0891b2', '#0e7490'];

  const alerts = React.useMemo(() => {
    const list = [];
    
    // ROI Negative
    if (latestROI && latestROI.roiPercentage < 0) {
      list.push({ type: 'error', message: 'ROI Negativo detectado en la última evaluación.', icon: <AlertCircle className="text-red-500" size={14} /> });
    }
    
    // Low Leads
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const recentLeads = leads.filter(l => new Date(l.addedAt) > lastMonth);
    if (recentLeads.length < 10 && leads.length > 0) {
      list.push({ type: 'warning', message: `Baja captación de leads este mes (${recentLeads.length}/10 objetivo).`, icon: <TrendingUp className="text-amber-500 rotate-180" size={14} /> });
    }
    
    // Low Precision Score
    const lowScoreLeads = leads.filter(l => l.score < 40);
    if (lowScoreLeads.length > 0) {
      list.push({ type: 'info', message: `Tienes ${lowScoreLeads.length} leads con precisión muy baja (<40%).`, icon: <X className="text-cyan-500" size={14} /> });
    }
    
    // Strong Competition
    if (competitors.length > 5) {
      list.push({ type: 'warning', message: 'Detectada alta densidad de competencia en tu sector.', icon: <Target className="text-red-500" size={14} /> });
    }

    return list;
  }, [leads, latestROI, competitors]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  React.useEffect(() => {
    if (alerts.length > 0) {
      triggerToast(`Atención: Tienes ${alerts.length} alertas estratégicas pendientes.`);
    }
  }, []);

  return (
    <div className="space-y-8 relative">
      {/* Alert Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-50 bg-slate-900 border border-white/10 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] backdrop-blur-xl"
          >
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
              <Bell className="text-cyan-400 animate-bounce" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Notificación Nexus</p>
              <p className="text-xs text-white font-medium">{toastMessage}</p>
            </div>
            <button onClick={() => setShowToast(false)} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Central</h1>
          <p className="text-slate-400 mt-1">Resumen general de tu estrategia de marketing.</p>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-red-500 animate-pulse">
            <AlertTriangle size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{alerts.length} Alertas Críticas</span>
          </div>
        )}
      </header>
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Leads Totales</p>
          <p className="text-4xl font-bold text-white">{leads.length}</p>
          <div className="mt-4 flex items-center gap-2 text-cyan-400 text-[10px] font-bold uppercase tracking-tighter">
            <TrendingUp size={12} />
            <span>Actualizado Ahora</span>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">ROI Proyectado</p>
          <p className="text-4xl font-bold text-white">{latestROI?.roiPercentage?.toFixed(1) || 0}%</p>
          <div className="w-full bg-slate-800/40 h-1 mt-4 rounded-full overflow-hidden border border-white/5">
            <div className="bg-cyan-500 h-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" style={{ width: `${Math.min(latestROI?.roiPercentage || 0, 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Última Actividad</p>
          <p className="text-sm font-medium text-slate-200 line-clamp-1">{logs[0]?.action || 'Sin actividad'}</p>
          <p className="mt-2 text-[10px] text-cyan-500 font-mono italic opacity-60">{logs[0]?.module || '--'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="font-bold text-white tracking-tight">Información del Proyecto</h2>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase border border-cyan-500/30 px-2 py-0.5 rounded bg-cyan-500/10">MCP_API: ONLINE</span>
            </div>
            <div className="p-8 grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Propietario</p>
                <p className="text-slate-200 font-medium">{profile?.name || 'No configurado'}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">{profile?.email || ''}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Sector / Industria</p>
                <p className="text-slate-200 font-medium">{profile?.sector || 'No configurado'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="font-bold text-white tracking-tight">Cliente Objetivo (ICP)</h2>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-500/10">SYNC: READY</span>
            </div>
            <div className="p-8">
              {icp ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Segmento</p>
                      <p className="text-slate-200 font-medium text-sm">{icp.sector}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Empresa</p>
                      <p className="text-slate-200 font-medium text-sm">{icp.companySize}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Problema a Resolver</p>
                    <p className="text-slate-400 text-xs italic line-clamp-2">"{icp.problemSolved}"</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <ShieldCheck className="mx-auto text-slate-700 mb-2" size={32} />
                  <p className="text-xs text-slate-500">Define tu ICP para personalizar el dashboard.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2">
              <Bell size={14} className="text-cyan-400" /> Alertas Estratégicas
            </h2>
            <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{alerts.length}</span>
          </div>
          
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                  <div className="mt-0.5">{alert.icon}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-600 grayscale flex flex-col items-center gap-3">
                <ShieldCheck size={32} strokeWidth={1} />
                <p className="text-[10px] font-bold uppercase tracking-widest italic tracking-tighter">Sin amenazas detectadas</p>
              </div>
            )}
          </div>
          
          {alerts.length > 0 && (
            <div className="pt-4 mt-2">
              <button className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                Revisar Plan de Contingencia
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" /> Tendencia de Leads
            </h2>
            <div className="text-[10px] text-slate-500 font-mono">Últimos 12 Meses</div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadsData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#06b6d4" fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" /> Evolución del ROI
            </h2>
            <div className="text-[10px] text-slate-500 font-mono">Historial de Campañas</div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                />
                <Bar dataKey="roi" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30}>
                  {roiTrendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.roi < 0 ? '#ef4444' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2">
              <PieChartIcon size={14} className="text-cyan-400" /> Leads por Sector
            </h2>
          </div>
          <div className="h-[250px] w-full flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-[40%] space-y-2">
              {sectorData.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[10px] text-slate-400 truncate flex-1">{entry.name}</span>
                  <span className="text-[10px] text-white font-mono">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2">
              <BarChart3 size={14} className="text-violet-400" /> Conversión por Ciudad
            </h2>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leads.reduce((acc: any[], l) => {
                const found = acc.find(a => a.city === l.city);
                if (found) found.count++;
                else acc.push({ city: l.city, count: 1 });
                return acc;
              }, []).sort((a,b) => b.count - a.count).slice(0, 5)} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="city" 
                  type="category" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Profile Module ---
export const ProfileManager = () => {
  const { profile, setProfile } = useAppState();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<OwnerProfile>(profile || {
    name: '',
    email: '',
    personalUrl: '',
    companyUrl: '',
    sector: '',
    location: ''
  });



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white">Identidad del Proyecto</h1>
        <p className="text-slate-400 mt-1">Configuración técnica de tu presencia digital.</p>
      </header>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative overflow-hidden">
        {/* Success message overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 right-8 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 z-10 backdrop-blur-md"
            >
              <CheckCircle2 size={14} />
              PERFIL ACTUALIZADO CORRECTAMENTE
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre Completo</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-200 transition-all"
                placeholder="Ej. Juan Pérez"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Profesional</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-200 transition-all"
                placeholder="email@ejemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sector / Industria</label>
              <input 
                type="text"
                value={formData.sector}
                onChange={(e) => setFormData({...formData, sector: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-200 transition-all"
                placeholder="Ej. SaaS, Educación, Retail..."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ubicación (Ciudad, País)</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-200 transition-all"
                placeholder="Ej. Madrid, España"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">URL Personal / LinkedIn</label>
              <input 
                type="url" 
                value={formData.personalUrl}
                onChange={(e) => setFormData({...formData, personalUrl: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-200 transition-all"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">URL de la Empresa</label>
              <input 
                type="url" 
                value={formData.companyUrl}
                onChange={(e) => setFormData({...formData, companyUrl: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-200 transition-all"
                placeholder="https://mi-empresa.com"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full md:w-auto bg-cyan-600/20 border border-cyan-500/50 hover:bg-cyan-600/30 text-cyan-400 font-bold py-3 px-12 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            GUARDAR CONFIGURACIÓN
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Market Analysis Module ---
export const MarketAnalysis = () => {
  const { profile, audit, setAudit, competitors, addCompetitor, updateCompetitor, deleteCompetitor } = useAppState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);

  const [formData, setFormData] = useState<Partial<Competitor>>({
    name: '',
    website: '',
    sector: '',
    location: '',
    strengths: [],
    weaknesses: [],
    valueProposition: ''
  });

  const [tempStrengths, setTempStrengths] = useState('');
  const [tempWeaknesses, setTempWeaknesses] = useState('');

  const openAddModal = () => {
    setEditingCompetitor(null);
    setFormData({
      name: '',
      website: '',
      sector: '',
      location: '',
      strengths: [],
      weaknesses: [],
      valueProposition: ''
    });
    setTempStrengths('');
    setTempWeaknesses('');
    setIsModalOpen(true);
  };

  const openEditModal = (comp: Competitor) => {
    setEditingCompetitor(comp);
    setFormData(comp);
    setTempStrengths(comp.strengths.join(', '));
    setTempWeaknesses(comp.weaknesses.join(', '));
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData: Competitor = {
      ...(formData as Competitor),
      id: editingCompetitor?.id || Math.random().toString(36).substr(2, 9),
      strengths: tempStrengths.split(',').map(s => s.trim()).filter(Boolean),
      weaknesses: tempWeaknesses.split(',').map(s => s.trim()).filter(Boolean)
    };

    if (editingCompetitor) {
      updateCompetitor(finalData);
    } else {
      addCompetitor(finalData);
    }
    setIsModalOpen(false);
  };

  const runAnalysis = async () => {
    if (!profile) return alert('Primero configura tu perfil en la pestaña Identidad.');
    if (competitors.length === 0) return alert('Añade al menos un competidor para comparar.');
    
    setLoading(true);
    try {
      const result = await geminiService.conductAudit(profile, competitors);
      setAudit(result);
    } catch (e) {
      alert('Error en el análisis de IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-tighter">Competencia & Estrategia</h1>
          <p className="text-slate-400 text-sm">Gestiona tus rivales y detecta brechas de mercado con IA.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={openAddModal}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            AÑADIR COMPETIDOR
          </button>
          <button 
            onClick={runAnalysis}
            disabled={loading || !profile || competitors.length === 0}
            className="bg-cyan-600/20 border border-cyan-500/50 hover:bg-cyan-600/30 text-cyan-400 font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCcw className="animate-spin" size={16} /> : <Target size={16} />}
            DETECTAR MEJORAS AI
          </button>
        </div>
      </header>

      {/* Improvements Section */}
      <AnimatePresence>
        {audit && !loading && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-gradient-to-br from-cyan-950/20 to-transparent backdrop-blur-xl border border-cyan-500/30 p-8 rounded-3xl overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/40">
                <TrendingUp size={16} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Recomendaciones Estratégicas</h3>
                <p className="text-[10px] text-slate-500 font-mono">Última actualización: {new Date(audit.lastUpdate).toLocaleString()}</p>
              </div>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {audit.improvements.map((imp, i) => (
                <li key={i} className="bg-black/20 border border-white/5 p-4 rounded-2xl flex items-start gap-4 group">
                  <span className="text-cyan-500/40 font-mono font-bold text-lg leading-none group-hover:text-cyan-500 transition-colors">{String(i+1).padStart(2, '0')}</span>
                  <p className="text-slate-300 text-sm leading-relaxed">{imp}</p>
                </li>
              ))}
            </ul>
          </motion.section>
        )}
      </AnimatePresence>

      {loading && (
        <div className="bg-white/5 animate-pulse h-48 rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-4">
          <RefreshCcw className="animate-spin text-cyan-500" size={32} />
          <p className="text-cyan-400 font-mono text-[10px] uppercase tracking-widest">Ejecutando Deep Audit Engine...</p>
        </div>
      )}

      {/* Competitors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitors.map((comp) => (
          <div key={comp.id} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex flex-col h-full group hover:border-white/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <h4 className="text-white font-bold text-lg tracking-tight group-hover:text-cyan-400 transition-colors uppercase">{comp.name}</h4>
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-medium">
                  <Globe size={10} />
                  <span className="truncate max-w-[120px]">{comp.website.replace('https://', '')}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEditModal(comp)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all"><Edit3 size={14}/></button>
                <button onClick={() => deleteCompetitor(comp.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14}/></button>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-2">Propuesta de Valor</p>
                <p className="text-xs text-slate-400 italic">"{comp.valueProposition}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-emerald-500/60 font-bold uppercase tracking-widest mb-1">Fortalezas</p>
                  <ul className="text-[10px] text-slate-500 space-y-0.5">
                    {comp.strengths.slice(0, 3).map((s, i) => <li key={i} className="truncate">• {s}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-[9px] text-red-500/60 font-bold uppercase tracking-widest mb-1">Debilidades</p>
                  <ul className="text-[10px] text-slate-500 space-y-0.5">
                    {comp.weaknesses.slice(0, 3).map((w, i) => <li key={i} className="truncate">• {w}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-600 uppercase">{comp.sector}</span>
              <div className="flex items-center gap-1 text-[9px] text-slate-600">
                <MapPin size={10} />
                {comp.location}
              </div>
            </div>
          </div>
        ))}

        {competitors.length === 0 && !loading && (
          <button 
            onClick={openAddModal}
            className="md:col-span-2 lg:col-span-3 h-48 bg-white/5 border border-white/10 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 text-slate-600 hover:text-slate-400 hover:bg-white/[0.07] transition-all"
          >
            <Plus size={32} strokeWidth={1.5} />
            <p className="text-xs font-bold uppercase tracking-widest">Añadir tu primer competidor</p>
          </button>
        )}
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="text-white font-bold uppercase tracking-widest text-[10px]">{editingCompetitor ? 'Editar Competidor' : 'Nuevo Competidor'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nombre del Negocio</label>
                    <input 
                      type="text" required
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sitio Web</label>
                    <input 
                      type="url" required
                      value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sector</label>
                    <input 
                      type="text" required
                      value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ubicación</label>
                    <input 
                      type="text" required
                      value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Propuesta de Valor</label>
                    <textarea 
                      required rows={2}
                      value={formData.valueProposition} onChange={e => setFormData({...formData, valueProposition: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none resize-none"
                      placeholder="¿Qué ofrecen de forma única?"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest">Fortalezas (separadas por comas)</label>
                    <input 
                      type="text" 
                      value={tempStrengths} onChange={e => setTempStrengths(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      placeholder="Precio, SEO, Marca..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-red-500/60 font-bold uppercase tracking-widest">Debilidades (separadas por comas)</label>
                    <input 
                      type="text" 
                      value={tempWeaknesses} onChange={e => setTempWeaknesses(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-red-500 focus:outline-none"
                      placeholder="UX, Rapidez, Soporte..."
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-cyan-600/20 border border-cyan-500/50 hover:bg-cyan-600/30 text-cyan-400 font-bold py-3 rounded-xl transition-all"
                  >
                    {editingCompetitor ? 'GUARDAR CAMBIOS' : 'AÑADIR COMPETIDOR'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 border border-white/10 hover:bg-white/5 text-slate-400 font-bold rounded-xl transition-all"
                  >
                    CANCELAR
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- ICP Generator ---
export const ICPGenerator = () => {
  const { icp, setIcp } = useAppState();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<ICP>(icp || {
    sector: '',
    companySize: '',
    location: '',
    problemSolved: '',
    budgetRange: '',
    preferredChannel: '',
    urgency: 'Media',
    marketingIdeas: []
  });

  const channels = ['Web / SEO', 'Redes Sociales', 'Email Marketing', 'Llamada en frío', 'Eventos / Networking', 'Publicidad (Ads)'];
  const urgencies: ('Alta' | 'Media' | 'Baja')[] = ['Alta', 'Media', 'Baja'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIcp(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const generateIdeas = () => {
    const ideas = [
      `Campaña de ${formData.preferredChannel} enfocada en ${formData.problemSolved}.`,
      `Webinar específico para el sector ${formData.sector} sobre soluciones de urgencia ${formData.urgency}.`,
      `Whitepaper sobre optimización de presupuestos de ${formData.budgetRange} en ${formData.location}.`,
      `Secuencia de emails para empresas de tamaño ${formData.companySize} resaltando el ahorro de costes.`,
      `Anuncios segmentados en ${formData.location} para el sector ${formData.sector}.`
    ];
    const updatedIcp = { ...formData, marketingIdeas: ideas };
    setFormData(updatedIcp);
    setIcp(updatedIcp);
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-tighter">Perfil de Cliente (ICP)</h1>
          <p className="text-slate-400 text-sm">Define exactamente a quién vendes para optimizar tu conversión.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative overflow-hidden">
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 right-8 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 z-10 backdrop-blur-md"
              >
                <CheckCircle2 size={14} />
                ICP GUARDADO
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sector Objetivo</label>
                <input 
                  type="text" required
                  value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  placeholder="Ej. Real Estate, Tecnología..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tamaño de Empresa</label>
                <input 
                  type="text" required
                  value={formData.companySize} onChange={e => setFormData({...formData, companySize: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  placeholder="Ej. 10-50 empleados, Multinacional..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ubicación</label>
                <input 
                  type="text" required
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  placeholder="Ej. Madrid, España / Latam"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Presupuesto Estimado</label>
                <input 
                  type="text" required
                  value={formData.budgetRange} onChange={e => setFormData({...formData, budgetRange: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  placeholder="Ej. €2.000 - €10.000 / mes"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Canal Preferido</label>
                <select 
                  value={formData.preferredChannel} onChange={e => setFormData({...formData, preferredChannel: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none appearance-none"
                  required
                >
                  <option value="" disabled className="bg-slate-900">Seleccionar canal</option>
                  {channels.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nivel de Urgencia</label>
                <div className="flex gap-2">
                  {urgencies.map(u => (
                    <button
                      key={u} type="button"
                      onClick={() => setFormData({...formData, urgency: u})}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                        formData.urgency === u 
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                        : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Problema que resuelve el servicio</label>
              <textarea 
                required rows={3}
                value={formData.problemSolved} onChange={e => setFormData({...formData, problemSolved: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none resize-none"
                placeholder="Describe el dolor principal que eliminas..."
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all uppercase tracking-widest text-xs"
            >
              Cargar Configuración ICP
            </button>
          </form>
        </div>

        {/* Summary Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-black border border-white/10 p-6 rounded-3xl shadow-xl">
            <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
              <ShieldCheck size={14} /> Resumen del Perfil
            </h3>
            {icp ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Sector</p>
                    <p className="text-[10px] text-slate-300 truncate">{icp.sector}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Ubicación</p>
                    <p className="text-[10px] text-slate-300 truncate">{icp.location}</p>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] text-slate-500 font-bold uppercase mb-2">Pain Point Principal</p>
                  <p className="text-xs text-slate-300 leading-relaxed italic">"{icp.problemSolved}"</p>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-[9px] text-slate-500 uppercase font-mono">Urgencia: <span className="text-cyan-400">{icp.urgency}</span></span>
                  <span className="text-[9px] text-slate-500 uppercase font-mono">Canal: <span className="text-cyan-400">{icp.preferredChannel}</span></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-8">No hay ICP configurado todavía.</p>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-bold uppercase tracking-widest text-[10px]">Ideas de Marketing</h3>
              <button 
                onClick={generateIdeas}
                disabled={!icp}
                className="text-cyan-400 hover:text-cyan-300 text-[10px] font-bold flex items-center gap-1 transition-colors disabled:opacity-30"
              >
                <RefreshCcw size={10} /> REGENERAR
              </button>
            </div>
            <div className="space-y-2">
              {icp?.marketingIdeas && icp.marketingIdeas.length > 0 ? (
                icp.marketingIdeas.map((idea, i) => (
                  <div key={i} className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <p className="text-[11px] text-slate-400 leading-tight">{idea}</p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-600 italic">Pulsa regenerar para obtener sugerencias tácticas basadas en tu ICP.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Leads Search ---
export const LeadSearch = () => {
  const { leads, addLead, updateLead, deleteLead } = useAppState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Lead>>({
    companyName: '',
    sector: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    source: '',
    estimatedRevenue: '',
    notes: ''
  });

  const [filters, setFilters] = useState({
    sector: '',
    city: '',
    source: '',
    revenue: ''
  });

  const revenueOptions = ['0-50k', '50k-100k', '100k-500k', '500k-1M', '1M+'];
  const sourceOptions = ['Google Maps', 'Directorio', 'LinkedIn', 'Referido', 'Web Scrapping', 'Otros'];

  // Dynamic Google Maps loader
  const loadGoogleMapsApi = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Already loaded
      if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
        resolve();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        console.warn('Google Maps API key not configured');
        resolve();
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));
      document.head.appendChild(script);
    });
  };

  React.useEffect(() => {
    if (isModalOpen && searchInputRef.current) {
      loadGoogleMapsApi().then(() => {
        if ((window as any).google && (window as any).google.maps && searchInputRef.current) {
          const autocomplete = new (window as any).google.maps.places.Autocomplete(searchInputRef.current, {
            types: ['establishment'],
            fields: ['name', 'formatted_address', 'address_components', 'website', 'formatted_phone_number']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.name) return;

            let city = '';
            let country = '';
            if (place.address_components) {
              for (const component of place.address_components) {
                if (component.types.includes('locality')) city = component.long_name;
                if (component.types.includes('country')) country = component.long_name;
              }
            }

            setFormData(prev => ({
              ...prev,
              companyName: place.name,
              city: city || prev.city,
              country: country || prev.country,
              website: place.website || prev.website,
              phone: place.formatted_phone_number || prev.phone,
              source: 'Google Maps',
              notes: `Dirección: ${place.formatted_address || ''}.`
            }));
          });
        }
      }).catch(err => {
        console.error('Error loading Google Maps:', err);
      });
    }
  }, [isModalOpen]);

  const exportCSV = () => {
    exportToCSV('leads_nexus_ai.csv', leads);
  };

  const exportPDF = () => {
    const headers = ['Empresa', 'Sector', 'Ciudad', 'Email', 'Source', 'Score'];
    const data = leads.map(l => [l.companyName, l.sector, l.city, l.email, l.source, `${l.score}%`]);
    exportToPDF('Listado de Leads Estratégicos', 'Nexus AI Marketer', headers, data, 'leads_nexus_ai.pdf');
  };

  const calculateScore = (data: Partial<Lead>) => {
    const fields = ['companyName', 'sector', 'city', 'country', 'phone', 'email', 'website', 'source', 'estimatedRevenue', 'notes'];
    const filled = fields.filter(f => !!(data as any)[f]).length;
    return Math.floor((filled / fields.length) * 100);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const score = calculateScore(formData);
    const finalData: Lead = {
      ...(formData as Lead),
      id: editingLead?.id || Math.random().toString(36).substr(2, 9),
      addedAt: editingLead?.addedAt || new Date().toISOString(),
      score
    };

    if (editingLead) {
      updateLead(finalData);
    } else {
      addLead(finalData);
    }
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setEditingLead(null);
    setFormData({
      companyName: '',
      sector: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      source: '',
      estimatedRevenue: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormData(lead);
    setIsModalOpen(true);
  };

  const filteredLeads = leads.filter(l => {
    return (!filters.sector || l.sector.toLowerCase().includes(filters.sector.toLowerCase())) &&
           (!filters.city || l.city.toLowerCase().includes(filters.city.toLowerCase())) &&
           (!filters.source || l.source === filters.source) &&
           (!filters.revenue || l.estimatedRevenue === filters.revenue);
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-tighter">Buscador de Leads</h1>
          <p className="text-slate-400 text-sm">Gestiona y califica prospectos de alta intención.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden p-1">
            <button 
              onClick={exportCSV} 
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <Download size={12} /> CSV
            </button>
            <div className="w-[1px] bg-white/10 my-1"></div>
            <button 
              onClick={exportPDF} 
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <FileText size={12} /> PDF
            </button>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            AÑADIR LEAD
          </button>
        </div>
      </header>

      {/* Filters Section */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Sector</label>
          <input 
            type="text"
            value={filters.sector}
            onChange={e => setFilters({...filters, sector: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="Filtrar sector..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ciudad</label>
          <input 
            type="text"
            value={filters.city}
            onChange={e => setFilters({...filters, city: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="Filtrar ciudad..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Fuente</label>
          <select 
            value={filters.source}
            onChange={e => setFilters({...filters, source: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 appearance-none"
          >
            <option value="">Todas las fuentes</option>
            {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Facturación</label>
          <select 
            value={filters.revenue}
            onChange={e => setFilters({...filters, revenue: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 appearance-none"
          >
            <option value="">Cualquier rango</option>
            {revenueOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs translate-z-0">
            <thead>
              <tr className="border-b border-white/5 text-[9px] text-slate-500 uppercase font-bold tracking-widest bg-white/[0.02]">
                <th className="px-6 py-4">Empresa / Contacto</th>
                <th className="px-6 py-4">Ubicación</th>
                <th className="px-6 py-4 text-center">Precisión</th>
                <th className="px-6 py-4">Facturación</th>
                <th className="px-6 py-4">Fuente</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{lead.companyName}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">{lead.sector}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin size={12} className="text-slate-600" />
                      <span>{lead.city}, {lead.country}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${getScoreColor(lead.score)}`}>
                        {lead.score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-500 uppercase">{lead.estimatedRevenue}</td>
                  <td className="px-6 py-4">
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[9px] font-medium uppercase text-slate-400 border border-white/5">{lead.source}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(lead)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all"><Edit3 size={14}/></button>
                      <button onClick={() => deleteLead(lead.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-600 italic font-medium">No se han encontrado prospectos con los filtros actuales...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 w-full max-w-3xl rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="text-white font-bold uppercase tracking-widest text-[10px]">{editingLead ? 'Editar Lead' : 'Añadir Nuevo Lead'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                <div className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-2xl space-y-2 mb-2">
                  <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Search size={12} /> Buscar en Google Maps (Auto-rellenado)
                  </label>
                  <input 
                    ref={searchInputRef}
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none placeholder:text-slate-600"
                    placeholder="Ej. Restaurante Casa Pepe, Madrid..."
                  />
                  <p className="text-[9px] text-slate-500">Selecciona un lugar para completar automáticamente los datos.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nombre de la Empresa</label>
                    <input 
                      type="text" required
                      value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sector</label>
                    <input 
                      type="text" required
                      value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ciudad</label>
                    <input 
                      type="text" required
                      value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">País</label>
                    <input 
                      type="text" required
                      value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Email</label>
                    <input 
                      type="email"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Teléfono</label>
                    <input 
                      type="tel"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sitio Web</label>
                    <input 
                      type="url"
                      value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Fuente</label>
                    <select 
                      value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none appearance-none"
                      required
                    >
                      <option value="" disabled>Seleccionar fuente</option>
                      {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Facturación Estimada</label>
                    <select 
                      value={formData.estimatedRevenue} onChange={e => setFormData({...formData, estimatedRevenue: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none appearance-none"
                      required
                    >
                      <option value="" disabled>Rango de ingresos</option>
                      {revenueOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Notas / Observaciones</label>
                    <input 
                      type="text"
                      value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                      placeholder="Información adicional relevante..."
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-cyan-600/20 border border-cyan-500/50 hover:bg-cyan-600/30 text-cyan-400 font-bold py-3 rounded-xl transition-all"
                  >
                    {editingLead ? 'GUARDAR CAMBIOS' : 'AÑADIR LEAD'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 border border-white/10 hover:bg-white/5 text-slate-400 font-bold rounded-xl transition-all"
                  >
                    CANCELAR
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Marketing Generator ---
// --- Marketing Laboratory ---
export const MarketingGenerator = () => {
  const { profile, icp, addCampaign, campaigns } = useAppState();
  const [selected, setSelected] = useState({
    ideas: true,
    slogan: true,
    newsletter: true,
    brochure: true,
    banner: true,
    image: true
  });
  
  const [lastResult, setLastResult] = useState<MarketingCampaign | null>(campaigns[0]?.type === 'Lab Result' ? campaigns[0] : null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMarketing = async () => {
    if (!profile.name) {
      alert("Por favor, completa tu perfil de propietario primero.");
      return;
    }

    setIsGenerating(true);
    try {
      const businessName = profile.name;
      const productDescription = icp?.problemSolved || profile.sector || "Servicios profesionales";
      
      const result = await geminiService.generateMarketingPack(businessName, productDescription);
      
      let imageUrl = "";
      if (selected.image) {
        // Use the bannerPrompt or a general prompt for the image
        const imagePrompt = `High quality marketing visual for "${businessName}", representing: ${productDescription}. Professional, visually appealing. Style: Modern, clean.`;
        imageUrl = await geminiService.generateImage(imagePrompt, "16:9");
      }

      const finalResult: MarketingCampaign = {
        ...result,
        type: 'Lab Result',
        title: `Marketing Pack - ${icp?.sector || profile.sector || 'Nuevo'}`,
        imageUrl: imageUrl || undefined
      };

      setLastResult(finalResult);
      addCampaign(finalResult);
    } catch (error) {
      console.error("Error generating marketing:", error);
      alert("Hubo un error al generar el pack de marketing. Por favor, inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-tighter">Laboratorio de Marketing</h1>
          <p className="text-slate-400 text-sm">Genera activos creativos basados en tus plantillas y perfil.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl space-y-6">
            <h3 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">¿Qué deseas generar?</h3>
            
            <div className="space-y-3">
              {Object.entries(selected).map(([key, val]) => (
                <label key={key} className="flex items-center gap-3 group cursor-pointer">
                  <div 
                    onClick={() => setSelected({...selected, [key]: !val} as any)}
                    className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${val ? 'bg-cyan-500 border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-black/40 border-white/10 group-hover:border-white/20'}`}
                  >
                    {val && <CheckCircle2 size={12} className="text-black" />}
                  </div>
                  <span className={`text-sm tracking-tight capitalize ${val ? 'text-slate-200' : 'text-slate-500'}`}>
                    {key === 'ideas' ? 'Ideas de campaña' : 
                     key === 'newsletter' ? 'Newsletter' :
                     key === 'brochure' ? 'Folleto/Brochure' :
                     key === 'banner' ? 'Banner publicitario' :
                     key === 'image' ? 'Imagen IA' : key}
                  </span>
                </label>
              ))}
            </div>

            <button 
              onClick={generateMarketing}
              disabled={isGenerating}
              className={`w-full ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-600/30'} bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 font-bold py-3 rounded-xl transition-all uppercase tracking-widest text-xs mt-4`}
            >
              {isGenerating ? 'Generando...' : 'Generar Marketing'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/20 to-transparent border border-white/5 p-6 rounded-3xl">
            <h4 className="text-[10px] text-indigo-400 font-bold uppercase mb-2">Tip de Estrategia</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              "El mejor marketing no parece marketing. Enfócate en el problema que resuelves (Pain Point) antes que en las características de tu servicio."
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-8">
          {!lastResult ? (
            <div className="h-[400px] border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center opacity-40">
              <div className="text-center">
                <Megaphone size={48} className="mx-auto mb-4 text-slate-700" />
                <p className="text-sm font-medium">Selecciona tus activos y pulsa generar...</p>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-12"
            >
              {lastResult.ideas && (
                <section className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                  <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-[10px] mb-4">Ideas de Campaña</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lastResult.ideas.map((idea, i) => (
                      <div key={i} className="bg-black/20 p-4 rounded-2xl border border-white/5">
                        <p className="text-[11px] text-slate-300 leading-tight">{idea}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {lastResult.slogan && (
                <section className="bg-gradient-to-r from-cyan-900/10 to-violet-900/10 border border-white/10 p-8 rounded-3xl text-center">
                  <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">Slogan Propuesto</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic tracking-tight underline decoration-cyan-500/30">"{lastResult.slogan}"</p>
                </section>
              )}

              {lastResult.imageUrl && (
                <section className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group">
                  <div className="bg-white/5 p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Imagen Generada por IA</h3>
                    <div className="flex gap-2">
                       <ShieldCheck size={14} className="text-emerald-500/50" />
                       <span className="text-[10px] text-slate-500 font-mono">2.5_flash_image_v.1</span>
                    </div>
                  </div>
                  <div className="aspect-video relative overflow-hidden bg-black/40">
                    <img 
                      src={lastResult.imageUrl} 
                      alt="AI Generated Marketing"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <p className="text-[10px] text-white/70 italic uppercase tracking-widest">Visualización previa del activo publicitario</p>
                    </div>
                  </div>
                </section>
              )}

              {lastResult.newsletter && (
                <section className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                  <div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/5">
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Estructura de Newsletter</h3>
                    <div className="flex gap-2">
                       <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                       <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                       <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Asunto</p>
                      <p className="text-sm font-medium text-slate-200">{lastResult.newsletter.subject}</p>
                    </div>
                    <div className="space-y-4 text-xs text-slate-400 leading-relaxed font-serif p-6 bg-white/5 rounded-2xl">
                       <p>{lastResult.newsletter.intro}</p>
                       <p>{lastResult.newsletter.body}</p>
                       <button className="bg-cyan-500 text-black font-bold py-2 px-6 rounded-md !mt-6 text-[10px] uppercase">{lastResult.newsletter.cta}</button>
                    </div>
                  </div>
                </section>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {lastResult.flyer && (
                  <section className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">Texto para Folleto</h3>
                    <div className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line overflow-y-auto max-h-[200px] pr-2">
                      {lastResult.flyer}
                    </div>
                  </section>
                )}

                {lastResult.banner && (
                  <section className="bg-slate-900 border border-white/10 p-6 rounded-3xl flex flex-col justify-center items-center text-center">
                    <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Banner Visual</h3>
                    <div className="w-full aspect-[4/3] bg-gradient-to-br from-slate-800 to-black rounded-2xl border border-white/5 flex flex-col items-center justify-center p-6 shadow-inner">
                       <h4 className="text-lg font-bold text-white mb-2 leading-tight">{lastResult.banner.title}</h4>
                       <p className="text-xs text-slate-400 mb-6">{lastResult.banner.subtitle}</p>
                       <div className="bg-white text-black text-[9px] font-black px-4 py-2 rounded uppercase tracking-tighter">
                          {lastResult.banner.ctaButton}
                       </div>
                    </div>
                  </section>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Social Automation ---
export const SocialAutomation = () => {
  const { socialPosts, addSocialPost, updateSocialPost, deleteSocialPost } = useAppState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [formData, setFormData] = useState<Partial<SocialPost>>({
    date: new Date().toISOString().split('T')[0],
    platform: 'LinkedIn',
    content: '',
    imageUrl: '',
    status: 'Borrador'
  });

  const platforms: SocialPlatform[] = ['Facebook', 'Instagram', 'X', 'LinkedIn', 'TikTok'];
  const statuses: SocialStatus[] = ['Borrador', 'Programado', 'Publicado', 'Cancelado'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData: SocialPost = {
      ...(formData as SocialPost),
      id: editingPost?.id || Math.random().toString(36).substr(2, 9),
    };

    if (editingPost) {
      updateSocialPost(finalData);
    } else {
      addSocialPost(finalData);
    }
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setEditingPost(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      platform: 'LinkedIn',
      content: '',
      imageUrl: '',
      status: 'Borrador'
    });
    setIsModalOpen(true);
  };

  const generateAIImage = async () => {
    if (!formData.content) {
      alert("Por favor, escribe el contenido del post primero para que la IA tenga contexto.");
      return;
    }
    setIsGeneratingImage(true);
    try {
      const prompt = `Social media post visual for ${formData.platform}. Content: ${formData.content}. High quality, professional, engaging.`;
      const url = await geminiService.generateImage(prompt, "1:1");
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error("Error generating social image:", error);
      alert("Error al generar la imagen.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const openEditModal = (post: SocialPost) => {
    setEditingPost(post);
    setFormData(post);
    setIsModalOpen(true);
  };

  const getStatusStyle = (status: SocialStatus) => {
    switch (status) {
      case 'Publicado': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Programado': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Borrador': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'Cancelado': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-tighter">Automatización RRSS</h1>
          <p className="text-slate-400 text-sm">Gestiona y programa tu presencia en redes sociales.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          NUEVA PUBLICACIÓN
        </button>
      </header>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs translate-z-0">
            <thead>
              <tr className="border-b border-white/5 text-[9px] text-slate-500 uppercase font-bold tracking-widest bg-white/[0.02]">
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Plataforma</th>
                <th className="px-6 py-4">Contenido</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {socialPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-600 italic font-medium">No hay publicaciones programadas todavía...</td>
                </tr>
              ) : (
                socialPosts.sort((a,b) => b.date.localeCompare(a.date)).map(post => (
                  <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{post.date}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-white uppercase tracking-tight flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]"></div>
                         {post.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-slate-400 line-clamp-1 italic">"{post.content}"</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-widest ${getStatusStyle(post.status)}`}>
                          {post.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(post)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all"><Edit3 size={14}/></button>
                        <button onClick={() => deleteSocialPost(post.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="text-white font-bold uppercase tracking-widest text-[10px]">{editingPost ? 'Editar Publicación' : 'Nueva Publicación'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Fecha de Publicación</label>
                    <input 
                      type="date" required
                      value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Plataforma</label>
                    <select 
                      value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value as SocialPlatform})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none appearance-none"
                      required
                    >
                      {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Contenido del Post</label>
                    <textarea 
                      required rows={4}
                      value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none resize-none"
                      placeholder="¿Qué vas a comunicar?"
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">URL de Imagen (Opcional)</label>
                    <div className="flex gap-2">
                      <input 
                        type="url"
                        value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={generateAIImage}
                        disabled={isGeneratingImage}
                        className={`px-3 rounded-xl border transition-all ${isGeneratingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-500/10 border-cyan-500/50 text-cyan-400'}`}
                        title="Generar con IA"
                      >
                        {isGeneratingImage ? <span className="animate-spin block">◌</span> : <Sparkles size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Estado</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as SocialStatus})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none appearance-none"
                      required
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-cyan-600/20 border border-cyan-500/50 hover:bg-cyan-600/30 text-cyan-400 font-bold py-3 rounded-xl transition-all"
                  >
                    {editingPost ? 'GUARDAR CAMBIOS' : 'AÑADIR POST'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 border border-white/10 hover:bg-white/5 text-slate-400 font-bold rounded-xl transition-all"
                  >
                    CANCELAR
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- ROI Hub ---
export const ROIHub = () => {
  const { roiHistory, addROI, deleteROI } = useAppState();
  const [formData, setFormData] = useState({
    investment: '',
    leadsGenerated: '',
    salesMade: '',
    revenue: ''
  });

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = Number(formData.investment);
    const rev = Number(formData.revenue);
    const leads = Number(formData.leadsGenerated);
    const sales = Number(formData.salesMade);

    if (inv <= 0) return alert('La inversión debe ser mayor a 0');

    const roiPercentage = ((rev - inv) / inv) * 100;

    const newReport: ROIReport = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(),
      investment: inv,
      leadsGenerated: leads,
      salesMade: sales,
      revenue: rev,
      roiPercentage
    };

    addROI(newReport);
    setFormData({
      investment: '',
      leadsGenerated: '',
      salesMade: '',
      revenue: ''
    });
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-tighter">Cálculo de ROI</h1>
          <p className="text-slate-400 text-sm">Mide la rentabilidad de tus campañas y esfuerzos de marketing.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-white font-bold uppercase tracking-widest text-[10px]">Nueva Evaluación</h3>
            <form onSubmit={calculate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Inversión (€)</label>
                <input 
                  type="number" required
                  value={formData.investment} onChange={e => setFormData({...formData, investment: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none font-mono"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ingresos (€)</label>
                <input 
                  type="number" required
                  value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none font-mono"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Leads</label>
                  <input 
                    type="number" required
                    value={formData.leadsGenerated} onChange={e => setFormData({...formData, leadsGenerated: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none font-mono"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ventas</label>
                  <input 
                    type="number" required
                    value={formData.salesMade} onChange={e => setFormData({...formData, salesMade: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none font-mono"
                    placeholder="0"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-cyan-600/20 border border-cyan-500/50 hover:bg-cyan-600/30 text-cyan-400 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all mt-4"
              >
                Calcular Rendimiento
              </button>
            </form>
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] text-slate-500 uppercase font-bold tracking-widest bg-white/[0.02]">
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Inversión / Ingresos</th>
                    <th className="px-6 py-4">Conversión</th>
                    <th className="px-6 py-4 text-center">ROI</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {roiHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-600 italic font-medium">No hay cálculos registrados todavía...</td>
                    </tr>
                  ) : (
                    roiHistory.map(report => (
                      <tr key={report.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{report.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">€{report.revenue.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-500">inv: €{report.investment.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-slate-300">{report.salesMade} ventas</span>
                            <span className="text-[10px] text-slate-500">{report.leadsGenerated} leads</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border transition-colors ${report.roiPercentage >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                              {report.roiPercentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => deleteROI(report.id)}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MCP / API Panel ---
export const MCPPanel = () => {
  const state = useAppState();
  const [entity, setEntity] = useState('leads');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const entities = [
    { id: 'leads', label: '/api/leads', data: state.leads },
    { id: 'icp', label: '/api/icp', data: state.icp },
    { id: 'competitors', label: '/api/competitors', data: state.competitors },
    { id: 'posts', label: '/api/posts', data: state.socialPosts },
    { id: 'roi', label: '/api/roi', data: state.roiHistory },
    { id: 'owner', label: '/api/owner', data: state.profile },
    { id: 'marketing', label: '/api/marketing', data: state.campaigns },
    { id: 'logs', label: '/api/logs', data: state.logs },
  ];

  const fetchSimulatedApi = () => {
    setLoading(true);
    const selected = entities.find(e => e.id === entity);
    
    // Simulate network delay
    setTimeout(() => {
      setResponse(selected?.data || { error: 'Not found' });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-tighter">Nexus API Browser</h1>
          <p className="text-slate-400 text-sm">Simulación de endpoints MCP para integración con herramientas externas.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Seleccionar Endpoint</label>
              <select 
                value={entity} 
                onChange={(e) => setEntity(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none appearance-none cursor-pointer"
              >
                {entities.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </div>

            <button 
              onClick={fetchSimulatedApi}
              disabled={loading}
              className="w-full bg-indigo-600/20 border border-indigo-500/50 hover:bg-indigo-600/30 text-indigo-400 font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-[10px]"
            >
              {loading ? 'FLETCHING...' : 'EJECUTAR REQUEST_GET'}
            </button>
          </div>

          <div className="bg-black/40 border border-white/5 p-6 rounded-3xl">
             <h4 className="text-[10px] text-slate-500 font-bold uppercase mb-4">Notas Técnicas</h4>
             <ul className="space-y-3">
               <li className="text-[11px] text-slate-400 flex gap-2">
                  <span className="text-indigo-500 font-bold">01</span>
                  <span>En producción, estos endpoints utilizarán Firebase Functions.</span>
               </li>
               <li className="text-[11px] text-slate-400 flex gap-2">
                  <span className="text-indigo-500 font-bold">02</span>
                  <span>Soporta autenticación via Bearer Token (Simulado).</span>
               </li>
               <li className="text-[11px] text-slate-400 flex gap-2">
                  <span className="text-indigo-500 font-bold">03</span>
                  <span>Formato de respuesta: application/json.</span>
               </li>
             </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#0f1117] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
            <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
               <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
               </div>
               <span className="text-[10px] font-mono text-slate-500 italic">api_inspector_v1.0.js</span>
            </div>
            <div className="p-6 flex-1 overflow-auto font-mono text-xs text-indigo-300">
               {loading ? (
                 <div className="h-full flex items-center justify-center">
                    <span className="animate-pulse">Waiting for server response...</span>
                 </div>
               ) : response ? (
                 <pre>{JSON.stringify(response, null, 2)}</pre>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-20 text-slate-500 grayscale">
                    <Terminal size={48} className="mb-4" />
                    <p>Execute a request to view raw data.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Documentation / Help ---
export const Documentation = () => {
  const sections = [
    {
      title: 'Propósito General',
      content: 'Nexus AI es una plataforma de inteligencia estratégica diseñada para optimizar el ciclo completo de marketing y ventas. Desde la definición de tu perfil como propietario hasta la generación de activos creativos y el análisis de rentabilidad (ROI).'
    },
    {
      title: 'Propietario',
      content: 'Configura tu identidad corporativa, sector y ubicación. Estos datos sirven de base para que la IA personalice todas las recomendaciones posteriores.'
    },
    {
      title: 'Competencia',
      content: 'Analiza a tus rivales directos. El sistema evalúa sus fortalezas y debilidades para encontrarte una ventaja competitiva clara.'
    },
    {
      title: 'ICP (Cliente Ideal)',
      content: 'Define el perfil de tu comprador perfecto. Entender sus dolores y retos es crucial para que el marketing sea efectivo.'
    },
    {
      title: 'Leads',
      content: 'Gestión de prospectos con Score de Precisión. El sistema califica cada lead basándose en la probabilidad de conversión según tu ICP.'
    },
    {
      title: 'Marketing Creativo',
      content: 'Genera ideas de campaña, slogans, borradores de anuncios y newsletters en segundos utilizando modelos generativos de IA.'
    },
    {
      title: 'RRSS (Redes Sociales)',
      content: 'Planifica y simula tu calendario de publicaciones. Permite gestionar borradores, programar posts y visualizar tu estrategia orgánica.'
    },
    {
      title: 'ROI & Métricas',
      content: 'Calculadora financiera para medir la efectividad de tus inversiones. Permite guardar un histórico de rendimientos para análisis comparativos.'
    },
    {
      title: 'Reportes y Precisión',
      content: 'Tracker de auditoría que registra cada acción importante y evalúa la precisión del sistema a lo largo del tiempo.'
    },
    {
      title: 'Nexus API / MCP',
      content: 'Panel técnico para simular la conexión con herramientas externas mediante endpoints estandarizados.'
    }
  ];

  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-tighter">Documentación</h1>
        <p className="text-slate-400 text-sm">Guía de uso y funcionamiento del ecosistema Nexus AI.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-cyan-500/30 transition-colors group">
            <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
               {section.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-indigo-900/10 border border-indigo-500/20 p-8 rounded-3xl text-center">
         <p className="text-xs text-slate-500 italic uppercase tracking-widest mb-2">Soporte Técnico</p>
         <p className="text-slate-300 text-sm">Para consultas avanzadas o integración de APIs reales, contacta con el administrador del sistema.</p>
      </div>
    </div>
  );
};

// --- Reports & Precision Tracker ---
export const ReportsTracker = () => {

  const { logs } = useAppState();
  
  const exportCSV = () => {
    exportToCSV('historial_logs_nexus.csv', logs);
  };

  const exportPDF = () => {
    const headers = ['Fecha', 'Módulo', 'Acción', 'Detalles'];
    const data = logs.map(l => [new Date(l.timestamp).toLocaleString(), l.module, l.action, l.details || '']);
    exportToPDF('Registro de Auditoría y Actividad', 'Nexus AI Marketer', headers, data, 'logs_nexus_ai.pdf');
  };

  const exportReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "reporte_marketing_precision.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-tighter">Reportes de Precisión</h1>
          <p className="text-slate-400 text-sm">Registro histórico de acciones y score de precisión del sistema.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden p-1">
            <button 
              onClick={exportCSV} 
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <Download size={12} /> CSV
            </button>
            <div className="w-[1px] bg-white/10 my-1"></div>
            <button 
              onClick={exportPDF} 
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <FileText size={12} /> PDF
            </button>
          </div>
          <button 
            onClick={exportReport}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2"
          >
            <Download size={16} />
            EXPORTAR JSON
          </button>
        </div>
      </header>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs translate-z-0">
            <thead>
              <tr className="border-b border-white/5 text-[9px] text-slate-500 uppercase font-bold tracking-widest bg-white/[0.02]">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Módulo</th>
                <th className="px-6 py-4">Acción</th>
                <th className="px-6 py-4">Detalles / ID</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-600 italic font-medium">No hay registros históricos todavía...</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-white/5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest text-cyan-400 border border-cyan-500/10">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white uppercase tracking-tight">
                      {log.action}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-400 font-mono text-[10px] truncate max-w-sm">
                        {log.details || 'N/A'}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-900/20 to-transparent border border-white/10 p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center">
        <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20">
           <ShieldCheck size={32} className="text-cyan-400" />
        </div>
        <div>
           <h4 className="text-white font-bold mb-1">Algoritmo de Precisión V1.0</h4>
           <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
             El sistema calcula la precisión basándose en la integridad de los datos (completitud de campos), 
             el sentimiento del análisis de competencia y la previsión del ROI. Los scores de leads reflejan 
             la probabilidad de conversión calculada algorítmicamente.
           </p>
        </div>
      </div>
    </div>
  );
};
