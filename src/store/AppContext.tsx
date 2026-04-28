
import React, { createContext, useContext, useState, useEffect } from 'react';
import { OwnerProfile, Lead, ActivityLog, MarketingCampaign, SocialPost, ROIReport, AuditResult, ICP, Competitor } from '../types';
import { auth, db, doc, collection, setDoc, getDoc, getDocs, query, deleteDoc, updateDoc, onAuthStateChanged, User, signInWithPopup, googleProvider, signOut, getDocFromServer } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AppState {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Test connection first
        try {
          await getDocFromServer(doc(db, 'users', u.uid, 'owner', 'data'));
        } catch (e) {
          console.warn("Initial connection check failed, retrying data load...");
        }
        loadUserData(u.uid);
      } else {
        // Reset state
        setProfileState(null);
        setCompetitorsState([]);
        setAudit(null);
        setIcpState(null);
        setLeads([]);
        setCampaigns([]);
        setSocialPosts([]);
        setRoiHistory([]);
        setLogs([]);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      // Profile
      const profileSnap = await getDoc(doc(db, 'users', uid, 'owner', 'data'));
      if (profileSnap.exists()) setProfileState(profileSnap.data() as OwnerProfile);

      // ICP
      const icpSnap = await getDoc(doc(db, 'users', uid, 'icp', 'data'));
      if (icpSnap.exists()) setIcpState(icpSnap.data() as ICP);

      // Audit
      const auditSnap = await getDoc(doc(db, 'users', uid, 'audit', 'data'));
      if (auditSnap.exists()) setAudit(auditSnap.data() as AuditResult);

      // Collections
      const leadsSnap = await getDocs(collection(db, 'users', uid, 'leads'));
      setLeads(leadsSnap.docs.map(d => d.data() as Lead));

      const competitorsSnap = await getDocs(collection(db, 'users', uid, 'competitors'));
      setCompetitorsState(competitorsSnap.docs.map(d => d.data() as Competitor));

      const postsSnap = await getDocs(collection(db, 'users', uid, 'posts'));
      setSocialPosts(postsSnap.docs.map(d => d.data() as SocialPost));

      const roiSnap = await getDocs(collection(db, 'users', uid, 'roi'));
      setRoiHistory(roiSnap.docs.map(d => d.data() as ROIReport));

      const logSnap = await getDocs(collection(db, 'users', uid, 'logs'));
      setLogs(logSnap.docs.map(d => d.data() as ActivityLog));

      const campaignSnap = await getDocs(collection(db, 'users', uid, 'marketing_content'));
      setCampaigns(campaignSnap.docs.map(d => d.data() as MarketingCampaign));

    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const addLog = async (module: string, action: string, details?: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      module,
      action,
      details
    };
    setLogs(prev => [newLog, ...prev]);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'logs', newLog.id), newLog);
    }
  };

  const setProfile = async (p: OwnerProfile) => {
    setProfileState(p);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'owner', 'data'), p);
      addLog('Profile', 'Updated profile information');
    }
  };

  const setIcp = async (i: ICP) => {
    setIcpState(i);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'icp', 'data'), i);
      addLog('ICP', 'Defined ideal customer profile');
    }
  };

  const handleSetAudit = async (a: AuditResult) => {
    setAudit(a);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'audit', 'data'), a);
      addLog('Analysis', 'Conducted marketing audit');
    }
  };

  const addLead = async (l: Lead) => {
    setLeads(prev => [l, ...prev]);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'leads', l.id), l);
      addLog('Leads', 'lead-added', `ID: ${l.id} - ${l.companyName}`);
    }
  };

  const updateLead = async (l: Lead) => {
    setLeads(prev => prev.map(old => old.id === l.id ? l : old));
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'leads', l.id), l);
      addLog('Leads', 'lead-updated', `ID: ${l.id}`);
    }
  };

  const deleteLead = async (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid, 'leads', id));
      addLog('Leads', `Eliminado lead`);
    }
  };

  const addLeads = async (ls: Lead[]) => {
    setLeads(prev => [...ls, ...prev]);
    if (user) {
      for (const l of ls) {
        await setDoc(doc(db, 'users', user.uid, 'leads', l.id), l);
      }
      addLog('Leads', `Añadidos ${ls.length} nuevos leads`);
    }
  };

  const addCompetitor = async (c: Competitor) => {
    setCompetitorsState(prev => [c, ...prev]);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'competitors', c.id), c);
      addLog('Competencia', 'competitor-added', `${c.name}`);
    }
  };

  const updateCompetitor = async (c: Competitor) => {
    setCompetitorsState(prev => prev.map(comp => comp.id === c.id ? c : comp));
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'competitors', c.id), c);
      addLog('Competencia', 'competitor-updated', `${c.name}`);
    }
  };

  const deleteCompetitor = async (id: string) => {
    setCompetitorsState(prev => prev.filter(c => c.id !== id));
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid, 'competitors', id));
      addLog('Competencia', `Eliminado competidor`);
    }
  };

  const addCampaign = async (c: MarketingCampaign) => {
    setCampaigns(prev => [c, ...prev]);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'marketing_content', c.id), c);
      addLog('Marketing', 'marketing-generated', `${c.title}`);
    }
  };

  const addSocialPost = async (p: SocialPost) => {
    setSocialPosts(prev => [p, ...prev]);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'posts', p.id), p);
      addLog('Social', 'post-scheduled', `${p.platform}`);
    }
  };

  const updateSocialPost = async (p: SocialPost) => {
    setSocialPosts(prev => prev.map(old => old.id === p.id ? p : old));
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'posts', p.id), p);
      addLog('Social', 'post-updated', `${p.platform}`);
    }
  };

  const deleteSocialPost = async (id: string) => {
    setSocialPosts(prev => prev.filter(p => p.id !== id));
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid, 'posts', id));
      addLog('Social', `Eliminada publicación`);
    }
  };

  const addROI = async (r: ROIReport) => {
    setRoiHistory(prev => [r, ...prev]);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'roi', r.id), r);
      addLog('ROI', 'roi-calculated');
    }
  };

  const deleteROI = async (id: string) => {
    setRoiHistory(prev => prev.filter(r => r.id !== id));
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid, 'roi', id));
      addLog('ROI', `Eliminado ROI`);
    }
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
