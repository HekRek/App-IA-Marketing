import React, { createContext, useContext, useState, useEffect } from 'react';
import { OwnerProfile, Lead, ActivityLog, MarketingCampaign, SocialPost, ROIReport, AuditResult, ICP, Competitor } from '../types';

// LocalStorage keys
const STORAGE_KEYS = {
  PROFILE: 'ai-marketer-profile',
  ICP: 'ai-marketer-icp',
  AUDIT: 'ai-marketer-audit',
  LEADS: 'ai-marketer-leads',
  COMPETITORS: 'ai-marketer-competitors',
  CAMPAIGNS: 'ai-marketer-campaigns',
  SOCIAL_POSTS: 'ai-marketer-posts',
  ROI_HISTORY: 'ai-marketer-roi',
  LOGS: 'ai-marketer-logs'
};

// Helper to load from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Helper to save to localStorage
const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substr(2);

interface AppState {
  // Auth simulation - always "logged in" locally
  user: { uid: string; email: string } | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Data
  profile: OwnerProfile | null;
  setProfile: (p: OwnerProfile) => void;
  audit: AuditResult | null;
  setAudit: (a: AuditResult) => void;
  icp: ICP | null;
  setIcp: (i: ICP) => void;
  leads: Lead[];
  addLead: (l: Lead) => void;
  updateLead: (l: Lead) => void;
  deleteLead: (id: string) => void;
  addLeads: (ls: Lead[]) => void;
  competitors: Competitor[];
  addCompetitor: (c: Competitor) => void;
  updateCompetitor: (c: Competitor) => void;
  deleteCompetitor: (id: string) => void;
  campaigns: MarketingCampaign[];
  addCampaign: (c: MarketingCampaign) => void;
  socialPosts: SocialPost[];
  addSocialPost: (p: SocialPost) => void;
  updateSocialPost: (p: SocialPost) => void;
  deleteSocialPost: (id: string) => void;
  roiHistory: ROIReport[];
  addROI: (r: ROIReport) => void;
  deleteROI: (id: string) => void;
  logs: ActivityLog[];
  addLog: (module: string, action: string, details?: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; email: string } | null>({ 
    uid: 'local-user', 
    email: 'local@example.com' 
  });
  const [loading, setLoading] = useState(true);
  const [profile, setProfileState] = useState<OwnerProfile | null>(null);
  const [competitors, setCompetitorsState] = useState<Competitor[]>([]);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [icp, setIcpState] = useState<ICP | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [roiHistory, setRoiHistory] = useState<ROIReport[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Load all data from localStorage on mount
  useEffect(() => {
    const loadAllData = () => {
      setProfileState(loadFromStorage<OwnerProfile | null>(STORAGE_KEYS.PROFILE, null));
      setIcpState(loadFromStorage<ICP | null>(STORAGE_KEYS.ICP, null));
      setAudit(loadFromStorage<AuditResult | null>(STORAGE_KEYS.AUDIT, null));
      setLeads(loadFromStorage<Lead[]>(STORAGE_KEYS.LEADS, []));
      setCompetitorsState(loadFromStorage<Competitor[]>(STORAGE_KEYS.COMPETITORS, []));
      setSocialPosts(loadFromStorage<SocialPost[]>(STORAGE_KEYS.SOCIAL_POSTS, []));
      setRoiHistory(loadFromStorage<ROIReport[]>(STORAGE_KEYS.ROI_HISTORY, []));
      setLogs(loadFromStorage<ActivityLog[]>(STORAGE_KEYS.LOGS, []));
      setCampaigns(loadFromStorage<MarketingCampaign[]>(STORAGE_KEYS.CAMPAIGNS, []));
      setLoading(false);
    };

    // Simulate slight delay for smooth initialization
    setTimeout(loadAllData, 500);
  }, []);

  // Persist data changes to localStorage
  useEffect(() => {
    if (!loading) {
      saveToStorage(STORAGE_KEYS.PROFILE, profile);
    }
  }, [profile, loading]);

  useEffect(() => {
    if (!loading) {
      saveToStorage(STORAGE_KEYS.ICP, icp);
    }
  }, [icp, loading]);

  useEffect(() => {
    if (!loading) {
      saveToStorage(STORAGE_KEYS.AUDIT, audit);
    }
  }, [audit, loading]);

  useEffect(() => {
    if (!loading) {
      saveToStorage(STORAGE_KEYS.LEADS, leads);
    }
  }, [leads, loading]);

  useEffect(() => {
    if (!loading) {
      saveToStorage(STORAGE_KEYS.COMPETITORS, competitors);
    }
  }, [competitors, loading]);

  useEffect(() => {
    if (!loading) {
      saveToStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
    }
  }, [campaigns, loading]);

  useEffect(() => {
    if (!loading) {
      saveToStorage(STORAGE_KEYS.SOCIAL_POSTS, socialPosts);
    }
  }, [socialPosts, loading]);

  useEffect(() => {
    if (!loading) {
      saveToStorage(STORAGE_KEYS.ROI_HISTORY, roiHistory);
    }
  }, [roiHistory, loading]);

  useEffect(() => {
    if (!loading) {
      saveToStorage(STORAGE_KEYS.LOGS, logs);
    }
  }, [logs, loading]);

  const loginWithGoogle = async (): Promise<void> => {
    // No-op: already "logged in"
    setUser({ uid: 'local-user', email: 'local@example.com' });
  };

  const logout = async (): Promise<void> => {
    setUser(null);
  };

  const addLog = (module: string, action: string, details?: string) => {
    const newLog: ActivityLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      module,
      action,
      details
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const setProfile = (p: OwnerProfile) => {
    setProfileState(p);
    addLog('Profile', 'Updated profile information');
  };

  const setIcp = (i: ICP) => {
    setIcpState(i);
    addLog('ICP', 'Defined ideal customer profile');
  };

  const handleSetAudit = (a: AuditResult) => {
    setAudit(a);
    addLog('Analysis', 'Conducted marketing audit');
  };

  const addLead = (l: Lead) => {
    setLeads(prev => [l, ...prev]);
    addLog('Leads', 'lead-added', `ID: ${l.id} - ${l.companyName}`);
  };

  const updateLead = (l: Lead) => {
    setLeads(prev => prev.map(old => old.id === l.id ? l : old));
    addLog('Leads', 'lead-updated', `ID: ${l.id}`);
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    addLog('Leads', `Eliminado lead`);
  };

  const addLeads = (ls: Lead[]) => {
    setLeads(prev => [...ls, ...prev]);
    addLog('Leads', `Añadidos ${ls.length} nuevos leads`);
  };

  const addCompetitor = (c: Competitor) => {
    setCompetitorsState(prev => [c, ...prev]);
    addLog('Competencia', 'competitor-added', `${c.name}`);
  };

  const updateCompetitor = (c: Competitor) => {
    setCompetitorsState(prev => prev.map(comp => comp.id === c.id ? c : comp));
    addLog('Competencia', 'competitor-updated', `${c.name}`);
  };

  const deleteCompetitor = (id: string) => {
    setCompetitorsState(prev => prev.filter(c => c.id !== id));
    addLog('Competencia', `Eliminado competidor`);
  };

  const addCampaign = (c: MarketingCampaign) => {
    setCampaigns(prev => [c, ...prev]);
    addLog('Marketing', 'marketing-generated', `${c.title}`);
  };

  const addSocialPost = (p: SocialPost) => {
    setSocialPosts(prev => [p, ...prev]);
    addLog('Social', 'post-scheduled', `${p.platform}`);
  };

  const updateSocialPost = (p: SocialPost) => {
    setSocialPosts(prev => prev.map(old => old.id === p.id ? p : old));
    addLog('Social', 'post-updated', `${p.platform}`);
  };

  const deleteSocialPost = (id: string) => {
    setSocialPosts(prev => prev.filter(p => p.id !== id));
    addLog('Social', `Eliminada publicación`);
  };

  const addROI = (r: ROIReport) => {
    setRoiHistory(prev => [r, ...prev]);
    addLog('ROI', 'roi-calculated');
  };

  const deleteROI = (id: string) => {
    setRoiHistory(prev => prev.filter(r => r.id !== id));
    addLog('ROI', `Eliminado ROI`);
  };

  return (
    <AppContext.Provider value={{
      user, loading, loginWithGoogle, logout,
      profile, setProfile,
      audit, setAudit: handleSetAudit,
      icp, setIcp,
      leads, addLead, updateLead, deleteLead, addLeads,
      competitors, addCompetitor, updateCompetitor, deleteCompetitor,
      campaigns, addCampaign,
      socialPosts, addSocialPost, updateSocialPost, deleteSocialPost,
      roiHistory, addROI, deleteROI,
      logs, addLog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
};
