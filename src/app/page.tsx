"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building2, FlaskConical, Globe, Sparkles, Flame, Wheat, ShoppingBag, 
  Menu, Download, X, ArrowUpRight, ArrowDownRight, Minus, TrendingUp, BarChart3, BrainCircuit,
  Loader2, Wand2, Moon, Sun, Bell, Send
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const themeColors = {
  blue: 'rgba(99, 102, 241, 1)', // Indigo neon
  blueLight: 'rgba(99, 102, 241, 0.15)',
  indigo: 'rgba(139, 92, 246, 1)', // Purple neon
  emerald: 'rgba(16, 185, 129, 1)',
  emeraldLight: 'rgba(16, 185, 129, 0.15)',
  rose: 'rgba(244, 63, 94, 1)',
  amber: 'rgba(245, 158, 11, 1)',
  slate: 'rgba(30, 41, 59, 0.8)',
  purple: 'rgba(168, 85, 247, 1)'
};

const iconMap: Record<string, React.ReactNode> = {
  "building-2": <Building2 className="w-5 h-5 mr-3" />,
  "flask-conical": <FlaskConical className="w-5 h-5 mr-3" />,
  "globe": <Globe className="w-5 h-5 mr-3" />,
  "sparkles": <Sparkles className="w-5 h-5 mr-3" />,
  "flame": <Flame className="w-5 h-5 mr-3" />,
  "wheat": <Wheat className="w-5 h-5 mr-3" />,
  "shopping-bag": <ShoppingBag className="w-5 h-5 mr-3" />
};

const CommentBox = ({ businessUnit, period, id, commentsList, tasksList, onSave, onDelete, onSaveTask, onToggleTask, onDeleteTask, globalUsers, label, className, userName, isAdmin }: any) => {
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  
  // Task state
  const [taskText, setTaskText] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const handleSaveTask = async () => {
    if (!taskText.trim() || !taskAssignee) return;
    setIsSavingTask(true);
    await onSaveTask(businessUnit, period, id, taskText, taskAssignee);
    setTaskText('');
    setTaskAssignee('');
    setShowTaskForm(false);
    setIsSavingTask(false);
  };

  const handleSave = async () => {
    if (!text.trim() || !userName) return;
    setIsSaving(true);
    await onSave(businessUnit, period, id, text, userName);
    setText('');
    setIsSaving(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;
    setIsDeletingId(commentId);
    await onDelete(commentId);
    setIsDeletingId(null);
  };

  return (
    <div className={className || "mt-5 pt-4 border-t border-slate-200 dark:border-slate-800"}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-outfit">{label || 'Comentarios del Equipo'}</h4>
      </div>
      
      {/* Chat History */}
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
        {(!commentsList || commentsList.length === 0) ? (
          <span className="italic text-xs text-slate-400 dark:text-slate-600">Sin comentarios registrados.</span>
        ) : (
          commentsList.map((c: any, idx: number) => (
            <div key={idx} className="bg-slate-50 dark:bg-[#1E293B] p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{c.user_name}</span>
                  <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                {(isAdmin || userName === c.user_name) && (
                  <button 
                    onClick={() => handleDelete(c.id)} 
                    disabled={isDeletingId === c.id}
                    className="text-[10px] text-rose-500 hover:text-rose-700 font-medium disabled:opacity-50"
                  >
                    {isDeletingId === c.id ? '...' : 'Eliminar'}
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="relative">
        <textarea 
          className="w-full bg-white dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg p-3 pr-24 text-sm focus:ring-indigo-500 focus:border-indigo-500 min-h-[60px] outline-none resize-y"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario..."
          disabled={isSaving}
        />
        <button 
          onClick={handleSave} 
          disabled={isSaving || !text.trim()} 
          className="absolute bottom-3 right-3 text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? '...' : 'Enviar'}
        </button>
      </div>

      {/* Tareas / Compromisos */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">📋 Compromisos</h4>
          <button onClick={() => setShowTaskForm(!showTaskForm)} className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline">+ Añadir Compromiso</button>
        </div>
        
        {tasksList && tasksList.map((t: any) => (
          <div key={t.id} className="flex items-start mb-2 group">
            <input 
              type="checkbox" 
              checked={t.completed} 
              onChange={() => onToggleTask(t.id, !t.completed)}
              disabled={t.assignee !== userName && !isAdmin}
              className="mt-1 mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50" 
            />
            <div className="flex-1">
              <p className={`text-sm ${t.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                {t.text}
              </p>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium">Asignado a: {t.assignee}</span>
                <span className="text-[9px] text-slate-400">Por: {t.created_by}</span>
                {(isAdmin || t.created_by === userName || t.assignee === userName) && (
                   <button onClick={() => onDeleteTask(t.id)} className="text-[9px] text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">Eliminar</button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {showTaskForm && (
          <div className="mt-3 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800">
            <select 
              value={taskAssignee} 
              onChange={e => setTaskAssignee(e.target.value)}
              className="w-full mb-2 p-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Seleccionar Responsable...</option>
              {globalUsers?.map((u: any) => <option key={u.username} value={u.username}>{u.username}</option>)}
            </select>
            <textarea
              value={taskText}
              onChange={e => setTaskText(e.target.value)}
              placeholder="Descripción del compromiso..."
              className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={2}
            />
            <div className="flex justify-end mt-2">
              <button 
                onClick={() => { setShowTaskForm(false); setTaskText(''); setTaskAssignee(''); }}
                className="mr-2 px-3 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveTask}
                disabled={isSavingTask || !taskText.trim() || !taskAssignee}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
              >
                {isSavingTask ? '...' : 'Guardar Compromiso'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getBarGradient = (ctx: any, element: any, colorStart: string, colorEnd: string) => {
  if (!element || typeof element.y !== 'number' || typeof element.base !== 'number') return colorStart;
  if (element.y === element.base) return colorStart;
  const gradient = ctx.createLinearGradient(0, element.y, 0, element.base);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('total');
  const [selectedPeriod, setSelectedPeriod] = useState('YTD');
  const [activeExpense, setActiveExpense] = useState<'sueldos'|'energia'|'fletes'|'mant'>('sueldos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [db, setDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [comments, setComments] = useState<any>({});

  // Identity State
  const [userName, setUserName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(true);
  const [loginNameInput, setLoginNameInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [globalUsers, setGlobalUsers] = useState<any[]>([]);
  
  // Admin User Creation State
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [createUserError, setCreateUserError] = useState('');
  const [tasks, setTasks] = useState<Record<string, any>>({});
  const [rawTasks, setRawTasks] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Compute pending tasks for current user
  const pendingTasks = rawTasks.filter(t => t.assignee === userName && !t.completed);

  useEffect(() => {
    const savedName = localStorage.getItem('induwell_username');
    const savedRole = localStorage.getItem('induwell_role');
    if (savedName) {
      setUserName(savedName);
      setIsAdmin(savedRole === 'admin');
      setShowLogin(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin && showAdminPanel) {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUsersList(data.users);
          }
        });
    }
  }, [isAdmin, showAdminPanel]);

  const toggleUserBan = async (userName: string, isBanned: boolean) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isBanned ? 'unban' : 'ban', username: userName })
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users);
        setGlobalUsers(data.users);
      }
    } catch (error) {
      console.error("Error toggling ban:", error);
    }
  };

  const createNewUser = async () => {
    if (!newUserName.trim() || !newUserPassword.trim()) {
      setCreateUserError('Nombre y contraseña son obligatorios');
      return;
    }
    setCreateUserError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', username: newUserName.trim(), password: newUserPassword.trim(), role: newUserRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users);
        setGlobalUsers(data.users);
        setNewUserName('');
        setNewUserPassword('');
        setNewUserRole('user');
      } else {
        setCreateUserError(data.error);
      }
    } catch (error) {
      setCreateUserError('Error al crear usuario');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('induwell_username');
    localStorage.removeItem('induwell_role');
    setUserName('');
    setIsAdmin(false);
    setShowLogin(true);
  };

  const handleLogin = async () => {
    const inputName = loginNameInput.trim();
    if (!inputName || !loginPasswordInput.trim()) {
      setLoginError('Ingresa usuario y contraseña.');
      return;
    }
    setLoginError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inputName, password: loginPasswordInput })
      });
      const data = await res.json();

      if (data.success) {
        setIsAdmin(data.user.role === 'admin');
        setUserName(data.user.username);
        localStorage.setItem('induwell_username', data.user.username);
        localStorage.setItem('induwell_role', data.user.role);
        setShowLogin(false);
      } else {
        setLoginError(data.error || 'Credenciales incorrectas');
      }
    } catch (e) {
      console.error("Error logging in", e);
      setLoginError('Error de conexión al servidor.');
    }
  };

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({});

  const generateAnalysis = async (tabId: string, period: string, currentData: any, isRegen = false) => {
    const analysisKey = `${tabId}-${period}`;
    setIsAnalyzing(prev => ({ ...prev, [analysisKey]: true }));
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: currentData, 
          period: period,
          tabId: tabId,
          regenerate: isRegen
        })
      });
      const result = await response.json();
      if (result.success) {
        setAiAnalysis(prev => ({ ...prev, [analysisKey]: result.analysis }));
      } else {
        alert("Error generando análisis: " + result.error);
      }
    } catch (error) {
      console.error("Error calling AI API:", error);
      alert("Error de conexión con la IA.");
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [analysisKey]: false }));
    }
  };

  // Fetch AI Analysis automatically if it exists in Supabase
  useEffect(() => {
    if (!activeTab || !selectedPeriod) return;
    const analysisKey = `${activeTab}-${selectedPeriod}`;
    if (aiAnalysis[analysisKey]) return;

    fetch(`/api/analyze?businessUnit=${activeTab}&period=${selectedPeriod}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.analysis) {
          setAiAnalysis(prev => ({ ...prev, [analysisKey]: data.analysis }));
        }
      })
      .catch(err => console.error("Error fetching AI analysis:", err));
  }, [activeTab, selectedPeriod]);

  useEffect(() => {
    fetch('/api/sync')
      .then(res => res.json())
      .then(data => {
        if(data.success && data.db) {
          setDb(data.db);
          if(data.db['total']) {
            setActiveTab('total');
          } else {
            setActiveTab(Object.keys(data.db)[0]);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching db:", err);
        setLoading(false);
      });

    // Fetch comments
    fetch('/api/comments')
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setComments(data.comments);
        }
      })
      .catch(err => console.error("Error fetching comments:", err));
  }, []);

  const saveComment = async (businessUnit: string, period: string, id: string, text: string, user_name: string) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessUnit, period, id, text, userName: user_name })
      });
      const data = await res.json();
      if(data.success) {
        setComments(data.comments);
      } else {
        alert("Error de guardado: " + data.error);
      }
    } catch (err) {
      console.error("Error saving comment:", err);
      alert("No se pudo guardar el comentario.");
    }
  };

  const deleteComment = async (commentUuid: string) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentUuid })
      });
      const data = await res.json();
      if(data.success) {
        setComments(data.comments);
      } else {
        alert("Error al eliminar: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("No se pudo eliminar el comentario.");
    }
  };

  const saveTask = async (businessUnit: string, period: string, id: string, text: string, assignee: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessUnit, period, id, text, assignee, createdBy: userName })
      });
      const data = await res.json();
      if(data.success) {
        setTasks(data.tasks);
        setRawTasks(data.rawTasks);
      } else {
        alert("Error de guardado: " + data.error);
      }
    } catch (err) {
      console.error("Error saving task:", err);
      alert("No se pudo guardar el compromiso.");
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    setRawTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t));
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, completed })
      });
      const data = await res.json();
      if(data.success) {
        setTasks(data.tasks);
        setRawTasks(data.rawTasks);
      }
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de eliminar este compromiso?')) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId })
      });
      const data = await res.json();
      if(data.success) {
        setTasks(data.tasks);
        setRawTasks(data.rawTasks);
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  if (loading || !db) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 flex-col">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">Sincronizando con Google Sheets...</h2>
        <p className="text-slate-500 mt-2">Construyendo análisis interactivo</p>
      </div>
    );
  }

  const subsidiaryData = db[activeTab];
  const isYtd = selectedPeriod === 'YTD';
  const data = isYtd ? subsidiaryData : (subsidiaryData.months[selectedPeriod] || subsidiaryData);
  const analysisKey = `${activeTab}-${selectedPeriod}`;

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-rose-500" />;
    return <Minus className="w-4 h-4 text-amber-500" />;
  };

  const getTypeStyles = (type: string, isActive: boolean) => {
    if (type === 'Maquila') {
      return isActive 
        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-50 font-semibold border-l-4 border-emerald-500 dark:shadow-[inset_4px_0_0_rgba(16,185,129,1)]' 
        : 'text-slate-500 dark:text-slate-400 font-medium border-l-4 border-transparent hover:bg-emerald-50 dark:hover:bg-emerald-500/5 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:text-slate-700 dark:hover:text-slate-200';
    }
    if (type === 'Comercialización') {
      return isActive 
        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-50 font-semibold border-l-4 border-amber-500 dark:shadow-[inset_4px_0_0_rgba(245,158,11,1)]' 
        : 'text-slate-500 dark:text-slate-400 font-medium border-l-4 border-transparent hover:bg-amber-50 dark:hover:bg-amber-500/5 hover:border-amber-300 dark:hover:border-amber-500/30 hover:text-slate-700 dark:hover:text-slate-200';
    }
    if (type === 'Otros') {
      return isActive 
        ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold border-l-4 border-slate-500 dark:shadow-[inset_4px_0_0_rgba(100,116,139,1)]' 
        : 'text-slate-500 dark:text-slate-400 font-medium border-l-4 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-200';
    }
    // Default (Consolidado)
    return isActive 
      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-50 font-semibold border-l-4 border-indigo-500 dark:shadow-[inset_4px_0_0_rgba(99,102,241,1)]' 
      : 'text-slate-500 dark:text-slate-400 font-medium border-l-4 border-transparent hover:bg-indigo-50 dark:hover:bg-indigo-500/5 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:text-slate-700 dark:hover:text-slate-200';
  };

  const navItems = Object.values(db).sort((a: any, b: any) => {
    if (a.id === 'total') return -1;
    if (b.id === 'total') return 1;
    return 0;
  }).map((item: any) => (
    <button
      key={item.id}
      onClick={() => {
        setActiveTab(item.id);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center px-6 py-3 transition-colors text-left group ${getTypeStyles(item.type, activeTab === item.id)}`}
    >
      <div className={`flex-shrink-0 mr-3 transition-colors ${
        activeTab === item.id 
          ? (item.type === 'Maquila' ? 'text-emerald-500' : item.type === 'Comercialización' ? 'text-amber-500' : item.type === 'Otros' ? 'text-slate-500' : 'text-indigo-500')
          : 'group-hover:text-slate-700 dark:group-hover:text-slate-300'
      }`}>
        {iconMap[item.icon] ? React.cloneElement(iconMap[item.icon] as React.ReactElement<any>, { className: "w-5 h-5 mr-0" }) : <ShoppingBag className="w-5 h-5 mr-0" />}
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="truncate leading-tight">{item.name}</span>
        {item.type && item.id !== 'total' && (
          <span className={`text-[10px] uppercase tracking-wider mt-0.5 ${
            activeTab === item.id 
              ? (item.type === 'Maquila' ? 'text-emerald-600 dark:text-emerald-400' : item.type === 'Comercialización' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400')
              : 'text-slate-400 dark:text-slate-500'
          }`}>
            {item.type}
          </span>
        )}
      </div>
    </button>
  ));

  // Calculation of labels with MoM for Trend
  const trendLabelsWithMom = subsidiaryData.charts.trend.labels.map((label: string, idx: number) => {
    const val = subsidiaryData.charts.trend.real[idx];
    const prevVal = idx > 0 ? subsidiaryData.charts.trend.real[idx - 1] : null;
    
    if (val !== null && val !== undefined && prevVal !== null && prevVal !== undefined && prevVal !== 0) {
      const mom = ((val - prevVal) / Math.abs(prevVal)) * 100;
      if (mom === 0) return [label, ''];
      const sign = mom > 0 ? '+' : '';
      const momStr = `${sign}${mom.toFixed(1)}%`;
      return [label, momStr];
    }
    return [label, ''];
  });

  // Chart configs
  const trendData = {
    labels: trendLabelsWithMom,
    datasets: [
      {
        label: 'Ventas Reales (M)',
        data: subsidiaryData.charts.trend.real,
        borderColor: themeColors.blue,
        backgroundColor: themeColors.blueLight,
        borderWidth: 3,
        pointBackgroundColor: isDarkMode ? '#0B0F19' : '#ffffff',
        pointBorderColor: themeColors.blue,
        pointRadius: 4,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Proyección (M)',
        data: subsidiaryData.charts.trend.proy,
        borderColor: themeColors.indigo,
        borderDash: [5, 5],
        borderWidth: 3,
        pointBackgroundColor: isDarkMode ? '#0B0F19' : '#ffffff',
        pointBorderColor: themeColors.indigo,
        pointRadius: 4,
        tension: 0.4
      }
    ]
  };

  // Calculation of labels with MoM for Trend Cost
  const trendCostLabelsWithMom = subsidiaryData.charts.trendCost ? subsidiaryData.charts.trendCost.labels.map((label: string, idx: number) => {
    const val = subsidiaryData.charts.trendCost.real[idx];
    const prevVal = idx > 0 ? subsidiaryData.charts.trendCost.real[idx - 1] : null;
    
    if (val !== null && val !== undefined && prevVal !== null && prevVal !== undefined && prevVal !== 0) {
      const mom = ((val - prevVal) / Math.abs(prevVal)) * 100;
      if (mom === 0) return [label, ''];
      const sign = mom > 0 ? '+' : '';
      const momStr = `${sign}${mom.toFixed(1)}%`;
      return [label, momStr];
    }
    return [label, ''];
  }) : [];

  const trendCostData = subsidiaryData.charts.trendCost ? {
    labels: trendCostLabelsWithMom,
    datasets: [
      {
        label: 'Costo Real (M)',
        data: subsidiaryData.charts.trendCost.real,
        borderColor: themeColors.rose,
        backgroundColor: 'rgba(244, 63, 94, 0.15)',
        borderWidth: 3,
        pointBackgroundColor: isDarkMode ? '#0B0F19' : '#ffffff',
        pointBorderColor: themeColors.rose,
        pointRadius: 4,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Proyección Costo (M)',
        data: subsidiaryData.charts.trendCost.proy,
        borderColor: themeColors.amber,
        borderDash: [5, 5],
        borderWidth: 3,
        pointBackgroundColor: isDarkMode ? '#0B0F19' : '#ffffff',
        pointBorderColor: themeColors.amber,
        pointRadius: 4,
        tension: 0.4
      }
    ]
  } : null;

  const ebitdaLabelsWithMom = subsidiaryData.charts.composition.type !== 'doughnut' ? subsidiaryData.charts.composition.labels.map((label: string, idx: number) => {
    const val = subsidiaryData.charts.composition.data[idx];
    const prevVal = idx > 0 ? subsidiaryData.charts.composition.data[idx - 1] : null;
    
    if (val !== null && val !== undefined && prevVal !== null && prevVal !== undefined && prevVal !== 0) {
      const mom = ((val - prevVal) / Math.abs(prevVal)) * 100;
      if (mom === 0) return [label, ''];
      const sign = mom > 0 ? '+' : '';
      const momStr = `${sign}${mom.toFixed(1)}%`;
      return [label, momStr];
    }
    return [label, ''];
  }) : subsidiaryData.charts.composition.labels;

  const compData = subsidiaryData.charts.composition.type === 'doughnut' ? {
    labels: subsidiaryData.charts.composition.labels,
    datasets: [{
      data: subsidiaryData.charts.composition.data,
      extraData: subsidiaryData.charts.composition.extraData,
      totalEbitda: subsidiaryData.charts.composition.totalEbitda,
      backgroundColor: (context: any) => {
        const baseColors = [
          themeColors.blue, themeColors.indigo, themeColors.emerald, 
          themeColors.amber, themeColors.purple, themeColors.rose,
          '#fbcfe8', '#fef08a', '#bbf7d0', '#bfdbfe', '#0ea5e9', '#ec4899', '#8b5cf6'
        ];
        const color = baseColors[context.dataIndex % baseColors.length];
        if (!context.chart.chartArea) return color;
        const fade = color.replace('1)', '0.3)');
        return getBarGradient(context.chart.ctx, context.chart.chartArea, color.replace('1)', '0.9)'), fade);
      },
      hoverBackgroundColor: (context: any) => {
        const baseColors = [
          themeColors.blue, themeColors.indigo, themeColors.emerald, 
          themeColors.amber, themeColors.purple, themeColors.rose,
          '#fbcfe8', '#fef08a', '#bbf7d0', '#bfdbfe', '#0ea5e9', '#ec4899', '#8b5cf6'
        ];
        const color = baseColors[context.dataIndex % baseColors.length];
        if (!context.chart.chartArea) return color;
        const fade = color.replace('1)', '0.6)');
        return getBarGradient(context.chart.ctx, context.chart.chartArea, color, fade);
      },
      borderWidth: 0,
      hoverOffset: 10
    }]
  } : {
    labels: ebitdaLabelsWithMom,
    datasets: [{
      label: 'EBITDA Mensual (M)',
      data: subsidiaryData.charts.composition.data,
      backgroundColor: (context: any) => {
        let baseColor = subsidiaryData.charts.composition.colors ? subsidiaryData.charts.composition.colors[context.dataIndex] : (context.raw < 0 ? themeColors.rose : themeColors.emerald);
        if (baseColor === '#f43f5e') baseColor = themeColors.rose;
        else if (baseColor === '#10b981') baseColor = themeColors.emerald;
        else if (baseColor === '#cbd5e1') baseColor = 'rgba(203, 213, 225, 1)';
        const fade = baseColor.replace('1)', '0.1)');
        return getBarGradient(context.chart.ctx, context.element, baseColor.replace('1)', '0.8)'), fade);
      },
      hoverBackgroundColor: (context: any) => {
        let baseColor = subsidiaryData.charts.composition.colors ? subsidiaryData.charts.composition.colors[context.dataIndex] : (context.raw < 0 ? themeColors.rose : themeColors.emerald);
        if (baseColor === '#f43f5e') baseColor = themeColors.rose;
        else if (baseColor === '#10b981') baseColor = themeColors.emerald;
        else if (baseColor === '#cbd5e1') baseColor = 'rgba(203, 213, 225, 1)';
        const fade = baseColor.replace('1)', '0.4)');
        return getBarGradient(context.chart.ctx, context.element, baseColor, fade);
      },
      borderRadius: 6
    }]
  };

  const expSource = subsidiaryData.charts.expenses;
  const activeExpData = expSource.data[activeExpense];
  const activeExpVentas = expSource.data.ventas;
  
  const expPctData = expSource.labels.map((_: any, i: number) => {
    return activeExpVentas[i] ? (activeExpData[i] / activeExpVentas[i]) * 100 : 0;
  });

  const activeColorMap = {
    'sueldos': themeColors.blue,
    'energia': themeColors.emerald,
    'fletes': themeColors.amber,
    'mant': themeColors.purple
  };

  const activeColor = activeColorMap[activeExpense];
  const selectedMonthIndex = isYtd ? expSource.labels.length - 1 : subsidiaryData.availableMonths.indexOf(selectedPeriod);

  const expensesData = {
    labels: expSource.labels,
    datasets: [
      {
        type: 'line' as const,
        label: '% s/Ventas',
        data: expPctData,
        borderColor: activeColor,
        backgroundColor: activeColor,
        borderWidth: 2,
        pointBackgroundColor: isDarkMode ? '#0B0F19' : '#ffffff',
        pointBorderColor: activeColor,
        pointRadius: 4,
        yAxisID: 'y1',
        tension: 0.4
      },
      {
        type: 'bar' as const,
        label: activeExpense.charAt(0).toUpperCase() + activeExpense.slice(1),
        data: activeExpData,
        backgroundColor: (context: any) => {
          if (!context.chart.ctx || !context.element) return activeColor;
          const isActive = context.dataIndex === selectedMonthIndex;
          if (isActive) {
            return getBarGradient(context.chart.ctx, context.element, activeColor, activeColor.replace('1)', '0.3)'));
          }
          return isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        },
        borderColor: (context: any) => {
          const isActive = context.dataIndex === selectedMonthIndex;
          return isActive ? activeColor : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
        },
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'y'
      }
    ]
  };

  const pnlData = {
    labels: subsidiaryData.charts.pnl.labels,
    datasets: [{
      label: 'Acumulado YTD (M)',
      data: subsidiaryData.charts.pnl.data,
      backgroundColor: (context: any) => {
        const val = context.raw;
        const color = val < 0 ? themeColors.rose : themeColors.blue;
        const fade = val < 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)';
        return getBarGradient(context.chart.ctx, context.element, color.replace('1)', '0.8)'), fade);
      },
      hoverBackgroundColor: (context: any) => {
        const val = context.raw;
        const color = val < 0 ? themeColors.rose : themeColors.blue;
        const fade = val < 0 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(99, 102, 241, 0.4)';
        return getBarGradient(context.chart.ctx, context.element, color, fade);
      },
      borderRadius: 6
    }]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: isDarkMode ? '#94a3b8' : '#475569', font: { family: 'Outfit', size: 12 } } },
      tooltip: { 
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 16,
        titleColor: '#94a3b8',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 12,
        titleFont: { family: 'Outfit', size: 12, weight: 'normal' as const },
        bodyFont: { family: 'Outfit', size: 14, weight: 'bold' as const },
        displayColors: true,
        usePointStyle: true,
        boxPadding: 8,
        callbacks: {
          label: function(context: any) {
            let labelStr = context.dataset.label || context.label || '';
            if (labelStr) {
              labelStr += ': ';
            }
            const value = typeof context.parsed === 'object' ? context.parsed.y : context.parsed;
            
            if (value !== null && value !== undefined && !isNaN(value)) {
              let formattedVal = '$' + new Intl.NumberFormat('en-US', {
                notation: "compact",
                compactDisplay: "short",
                maximumFractionDigits: 2
              }).format(value);
              
              if (context.chart.config.type === 'doughnut') {
                const total = context.chart._metasets[context.datasetIndex].total;
                if (total > 0) {
                  const percentage = ((value / total) * 100).toFixed(1);
                  const line1 = `${labelStr}${formattedVal} (${percentage}% Ventas)`;
                  
                  const ebitdaData = context.dataset.extraData;
                  if (ebitdaData && ebitdaData[context.dataIndex] !== undefined) {
                    const ebitdaVal = ebitdaData[context.dataIndex];
                    const totalEbitda = context.dataset.totalEbitda;
                    const ebitdaPct = totalEbitda ? ((ebitdaVal / totalEbitda) * 100).toFixed(1) : 0;
                    const formattedEbitda = '$' + new Intl.NumberFormat('en-US', {
                      notation: "compact",
                      compactDisplay: "short",
                      maximumFractionDigits: 2
                    }).format(ebitdaVal);
                    
                    const line2 = `EBITDA: ${formattedEbitda} (${ebitdaPct}% del Grupo)`;
                    return [line1, line2];
                  }
                  return line1;
                }
              }
              return labelStr + formattedVal;
            }
            return labelStr;
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: isDarkMode ? '#64748b' : '#64748b', font: { family: 'Outfit' } } },
      y: { 
        grid: { color: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.8)', borderDash: [4, 4] }, 
        ticks: { 
          color: isDarkMode ? '#64748b' : '#64748b', 
          font: { family: 'Outfit' },
          callback: function(value: any) {
            return '$' + new Intl.NumberFormat('en-US', {
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 2
            }).format(value);
          }
        } 
      }
    }
  };

  const momTickOptions = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      x: {
        ...commonOptions.scales.x,
        ticks: {
          ...commonOptions.scales.x.ticks,
          font: { family: 'Outfit', size: 10 },
          color: (context: any) => {
            if (context.tick && Array.isArray(context.tick.label) && context.tick.label[1]) {
              const momStr = context.tick.label[1];
              if (momStr.startsWith('+')) return themeColors.emerald;
              if (momStr.startsWith('↓') || momStr.startsWith('-')) return themeColors.rose;
            }
            return isDarkMode ? '#64748b' : '#64748b';
          }
        }
      }
    }
  };

  const expensesOptions = {
    ...commonOptions,
    scales: {
      x: { grid: { display: false }, ticks: { color: isDarkMode ? '#64748b' : '#64748b', font: { family: 'Outfit' } } },
      y: { 
        grid: { color: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.8)', borderDash: [4, 4] },
        ticks: { 
          color: isDarkMode ? '#64748b' : '#64748b', 
          font: { family: 'Outfit' },
          callback: function(value: any) {
            return '$' + new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short", maximumFractionDigits: 2 }).format(value);
          }
        } 
      },
      y1: {
        position: 'right' as const,
        grid: { display: false },
        ticks: {
          color: themeColors.rose,
          font: { family: 'Outfit' },
          callback: function(value: any) {
            return Number(value).toFixed(2) + '%';
          }
        }
      }
    },
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.dataset.yAxisID === 'y1') {
              return label + context.parsed.y.toFixed(1) + '%';
            }
            return label + '$' + new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short", maximumFractionDigits: 2 }).format(context.parsed.y);
          }
        }
      }
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-[#0B0F19] font-sans relative transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white dark:bg-[#111827]/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 flex-col hidden md:flex z-20 shadow-sm dark:shadow-xl overflow-y-auto relative transition-colors duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 relative z-10">
          <div className="hidden dark:block absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/20 blur-[50px] pointer-events-none rounded-full"></div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">INDUWELL</h1>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wider mt-1">Inteligencia Financiera</p>
        </div>
        <div className="flex-1 py-4 space-y-1 relative z-10">
          {navItems}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 relative z-10">
          Cifras expresadas en MXN.<br/>Conectado a Google Sheets en tiempo real.
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 transition-colors duration-300">
        <div className="hidden dark:block absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full z-0"></div>
        <div className="hidden dark:block absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full z-0"></div>

        {/* Header */}
        <header className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm dark:shadow-md z-20 relative transition-colors duration-300">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu />
            </button>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white font-outfit tracking-wide">{data.name}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 shadow-sm cursor-pointer outline-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <option value="YTD">Acumulado (YTD)</option>
              {subsidiaryData.availableMonths?.map((m: string) => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()}</option>
              ))}
            </select>
            <span className="hidden sm:inline-flex text-sm font-medium px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-500/20 items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-2 animate-pulse dark:shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              Live Sync
            </span>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative mt-1"
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {pendingTasks.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#0B0F19]"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#111827] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
                  <div className="p-3 bg-slate-50 dark:bg-[#0B0F19] border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm font-outfit">Mis Compromisos</h3>
                    <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {pendingTasks.length} pendientes
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {pendingTasks.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm">
                        No tienes tareas pendientes. ¡Excelente!
                      </div>
                    ) : (
                      pendingTasks.map((t: any) => (
                        <div key={t.id} className="p-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors text-left">
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1 leading-snug">{t.text}</p>
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span>Por: {t.created_by}</span>
                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider">{t.business_unit}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" 
              title="Alternar Tema"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isAdmin && (
              <button 
                onClick={() => setShowAdminPanel(true)}
                className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors items-center"
              >
                👥 Panel de Usuarios
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 z-10 relative">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* KPIs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.kpis.map((kpi: any, idx: number) => (
                <div key={idx} className="bg-white dark:bg-[#111827] rounded-xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between relative overflow-hidden group transition-colors duration-300">
                  <div className="hidden dark:block absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{kpi.label}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit tracking-wide">{kpi.value}</h3>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm relative z-10">
                    <span className="text-slate-500">{kpi.sub}</span>
                    <div className="flex items-center font-medium bg-slate-50 dark:bg-[#1E293B] px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700/50">
                      {getTrendIcon(kpi.trend)}
                      <span className="ml-1 text-slate-700 dark:text-slate-300 text-xs">{kpi.trendVal}</span>
                    </div>
                  </div>
                  {kpi.avgDesc && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 relative z-10">
                      <p className="text-xs text-slate-500 dark:text-indigo-400/80 italic font-medium">{kpi.avgDesc}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* KPI Comments */}
            <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-800 p-5 relative overflow-hidden transition-colors duration-300">
              <CommentBox 
                businessUnit={activeTab} 
                period={selectedPeriod} 
                id="kpis" 
                commentsList={comments?.[activeTab]?.[selectedPeriod]?.['kpis']} 
                tasksList={tasks?.[activeTab]?.[selectedPeriod]?.['kpis']}
                userName={userName}
                isAdmin={isAdmin}
                onSave={saveComment}
                onDelete={deleteComment}
                globalUsers={globalUsers}
                onSaveTask={saveTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                label={`Comentarios Mensuales de Dirección - ${selectedPeriod}`}
                className=""
              />
            </div>

            {/* Insights C-Level */}
            <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden transition-colors duration-300">
              <div className="hidden dark:block absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400 border border-transparent dark:border-indigo-500/30">
                      <BrainCircuit />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white font-outfit tracking-wide">
                      {aiAnalysis[analysisKey] ? `Análisis Clínico (IA) - ${selectedPeriod}` : `Análisis Inteligente - ${selectedPeriod}`}
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    {!aiAnalysis[analysisKey] && !isAnalyzing[analysisKey] && isAdmin && (
                      <button 
                        onClick={() => generateAnalysis(activeTab, selectedPeriod, data)}
                        className="flex items-center space-x-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm dark:shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>Generar CFO Insights</span>
                      </button>
                    )}
                    {aiAnalysis[analysisKey] && !isAnalyzing[analysisKey] && isAdmin && (
                      <button 
                        onClick={() => generateAnalysis(activeTab, selectedPeriod, data, true)}
                        className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>Regenerar con Comentarios</span>
                      </button>
                    )}
                  </div>
                </div>
              
              {isAnalyzing[analysisKey] ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-500 mb-4" />
                  <p className="text-sm font-medium">El CFO Virtual está procesando el reporte clínico de {selectedPeriod}...</p>
                </div>
              ) : aiAnalysis[analysisKey] ? (
                <div className="prose prose-slate dark:prose-invert prose-sm md:prose-base max-w-none text-slate-700 dark:text-slate-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiAnalysis[analysisKey]}
                  </ReactMarkdown>
                </div>
              ) : (
                <div 
                  className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base space-y-3 [&>p]:mb-2 [&_strong]:text-indigo-600 dark:[&_strong]:text-indigo-300" 
                  dangerouslySetInnerHTML={{ __html: data.insights }} 
                />
              )}
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart: Tendencias */}
              <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col relative overflow-hidden transition-colors duration-300">
                <div className="hidden dark:block absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[60px] pointer-events-none rounded-full"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <h3 className="text-base font-semibold text-slate-800 dark:text-white font-outfit tracking-wide">Tendencia de Ventas</h3>
                  <TrendingUp className="text-slate-400 dark:text-slate-500 w-5 h-5" />
                </div>
                <div className="relative flex-1 z-10" style={{ minHeight: '300px' }}>
                  <Line data={trendData} options={momTickOptions as any} />
                </div>
                <div className="mt-4 p-3 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-100 dark:border-slate-700/50 relative z-10">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed [&_strong]:text-indigo-600 dark:[&_strong]:text-indigo-300" dangerouslySetInnerHTML={{ __html: subsidiaryData.charts.trend.desc }} />
                </div>
                <CommentBox 
                  businessUnit={activeTab} 
                  period="global" 
                  id="trend" 
                  commentsList={comments?.[activeTab]?.['global']?.['trend']} 
                  tasksList={tasks?.[activeTab]?.['global']?.['trend']}
                  userName={userName}
                  isAdmin={isAdmin}
                  onSave={saveComment}
                  onDelete={deleteComment}
                  globalUsers={globalUsers}
                  onSaveTask={saveTask}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  label="Metas y Plan de Acción (Global)"
                />
              </div>

              {/* Chart: Tendencias de Costo */}
              {subsidiaryData.charts.trendCost && trendCostData && (
                <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col relative overflow-hidden transition-colors duration-300">
                  <div className="hidden dark:block absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[60px] pointer-events-none rounded-full"></div>
                  <div className="flex justify-between items-center mb-4 relative z-10">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-white font-outfit tracking-wide">Tendencia de Costo de Ventas</h3>
                    <TrendingUp className="text-slate-400 dark:text-slate-500 w-5 h-5" />
                  </div>
                  <div className="relative flex-1 z-10" style={{ minHeight: '300px' }}>
                    <Line data={trendCostData} options={momTickOptions as any} />
                  </div>
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-100 dark:border-slate-700/50 relative z-10">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed [&_strong]:text-rose-600 dark:[&_strong]:text-rose-400" dangerouslySetInnerHTML={{ __html: subsidiaryData.charts.trendCost.desc }} />
                  </div>
                  <CommentBox 
                    businessUnit={activeTab} 
                    period="global" 
                    id="trendCost" 
                    commentsList={comments?.[activeTab]?.['global']?.['trendCost']} 
                    tasksList={tasks?.[activeTab]?.['global']?.['trendCost']}
                    userName={userName}
                    isAdmin={isAdmin}
                    onSave={saveComment}
                    onDelete={deleteComment}
                    globalUsers={globalUsers}
                    onSaveTask={saveTask}
                    onToggleTask={toggleTask}
                    onDeleteTask={deleteTask}
                    label="Metas y Plan de Acción (Costo)"
                  />
                </div>
              )}
              
              {/* Chart: Composición */}
              <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col relative overflow-hidden transition-colors duration-300">
                <div className="hidden dark:block absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[60px] pointer-events-none rounded-full"></div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-white font-outfit tracking-wide mb-4 relative z-10">{subsidiaryData.charts.composition.title}</h3>
                <div className="relative flex-1 z-10" style={{ minHeight: '300px' }}>
                  {subsidiaryData.charts.composition.type === 'doughnut' ? (
                     <Doughnut data={compData as any} options={{...commonOptions, scales: { x: { display: false }, y: { display: false } }, cutout: '65%'}} />
                  ) : (
                     <Bar data={compData as any} options={{...momTickOptions, plugins: { ...momTickOptions.plugins, legend: { display: false } }} as any} />
                  )}
                </div>
                <div className="mt-4 p-3 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-100 dark:border-slate-700/50 relative z-10">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed [&_strong]:text-indigo-600 dark:[&_strong]:text-indigo-300" dangerouslySetInnerHTML={{ __html: subsidiaryData.charts.composition.desc }} />
                </div>
                <CommentBox 
                  businessUnit={activeTab} 
                  period="global" 
                  id="composition" 
                  commentsList={comments?.[activeTab]?.['global']?.['composition']} 
                  tasksList={tasks?.[activeTab]?.['global']?.['composition']}
                  userName={userName}
                  isAdmin={isAdmin}
                  onSave={saveComment}
                  onDelete={deleteComment}
                  globalUsers={globalUsers}
                  onSaveTask={saveTask}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  label="Metas y Plan de Acción (Composición)"
                />
              </div>
            </div>

            {/* P&L Breakdown Chart */}
            <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col relative overflow-hidden transition-colors duration-300">
              <div className="hidden dark:block absolute top-0 left-1/2 w-96 h-64 bg-indigo-500/5 blur-[80px] pointer-events-none rounded-full -translate-x-1/2"></div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-base font-semibold text-slate-800 dark:text-white font-outfit tracking-wide">Estructura P&L (Miles)</h3>
                <BarChart3 className="text-slate-400 dark:text-slate-500 w-5 h-5" />
              </div>
              <div className="relative z-10" style={{ height: '250px' }}>
                <Bar data={pnlData} options={{...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } }} as any} />
              </div>
              <div className="mt-4 p-3 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-100 dark:border-slate-700/50 relative z-10">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed [&_strong]:text-indigo-600 dark:[&_strong]:text-indigo-300" dangerouslySetInnerHTML={{ __html: subsidiaryData.charts.pnl.desc }} />
              </div>
              <CommentBox 
                businessUnit={activeTab} 
                period="global" 
                id="pnl" 
                commentsList={comments?.[activeTab]?.['global']?.['pnl']} 
                tasksList={tasks?.[activeTab]?.['global']?.['pnl']}
                userName={userName}
                isAdmin={isAdmin}
                onSave={saveComment}
                onDelete={deleteComment}
                globalUsers={globalUsers}
                onSaveTask={saveTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                label="Metas y Plan de Acción (Global)"
              />
            </div>

          </div>

          {/* Charts Row 3: Gastos Críticos */}
          <div className="mt-6">
            <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col relative overflow-hidden transition-colors duration-300">
              <div className="hidden dark:block absolute top-0 left-0 w-64 h-64 bg-rose-500/5 blur-[60px] pointer-events-none rounded-full"></div>
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 relative z-10 space-y-4 md:space-y-0">
                <h3 className="text-base font-semibold text-slate-800 dark:text-white font-outfit tracking-wide">Auditoría Analítica de Gasto</h3>
                <div className="flex space-x-1 md:space-x-2 bg-slate-100 dark:bg-[#1E293B] p-1 rounded-lg">
                  {[
                    { id: 'sueldos', label: 'Sueldos' },
                    { id: 'energia', label: 'Energía' },
                    { id: 'fletes', label: 'Fletes' },
                    { id: 'mant', label: 'Mantto' }
                  ].map(expense => (
                    <button
                      key={expense.id}
                      onClick={() => setActiveExpense(expense.id as any)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        activeExpense === expense.id 
                          ? 'bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {expense.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="relative z-10 w-full" style={{ height: '300px' }}>
                <Bar data={expensesData as any} options={expensesOptions as any} />
              </div>
              
              <div className="mt-6 overflow-x-auto relative z-10">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-[#1E293B] dark:text-slate-400">
                    <tr>
                      <th scope="col" className="px-4 py-3 rounded-l-lg">Periodo</th>
                      <th scope="col" className="px-4 py-3">Importe ($)</th>
                      <th scope="col" className="px-4 py-3">% de Ventas</th>
                      <th scope="col" className="px-4 py-3 rounded-r-lg">Desviación (MoM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expSource.labels.map((month: string, idx: number) => {
                      const amount = activeExpData[idx];
                      const pct = expPctData[idx];
                      const prevPct = idx > 0 ? expPctData[idx-1] : pct;
                      const momDiff = pct - prevPct;
                      const isExpenseUp = momDiff > 0;
                      
                      return (
                        <tr key={month} className={`border-b dark:border-slate-800 ${idx === selectedMonthIndex ? 'bg-slate-50 dark:bg-[#1E293B]/50' : 'bg-white dark:bg-[#111827]'}`}>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center">
                            {idx === selectedMonthIndex && <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: activeColor}}></div>}
                            {month}
                          </td>
                          <td className="px-4 py-3">${new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(amount)}</td>
                          <td className="px-4 py-3">{pct.toFixed(1)}%</td>
                          <td className="px-4 py-3">
                            {idx === 0 ? <span className="text-slate-400">-</span> : (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${isExpenseUp ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                                {isExpenseUp ? '↑' : '↓'} {Math.abs(momDiff).toFixed(1)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-100 dark:border-slate-700/50 relative z-10">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed [&_strong]:text-rose-600 dark:[&_strong]:text-rose-400" dangerouslySetInnerHTML={{ __html: subsidiaryData.charts.expenses.desc }} />
              </div>
              <CommentBox 
                businessUnit={activeTab} 
                period={selectedPeriod} 
                id={`expenses_${activeExpense}`}
                commentsList={comments?.[activeTab]?.[selectedPeriod]?.[`expenses_${activeExpense}`]} 
                tasksList={tasks?.[activeTab]?.[selectedPeriod]?.[`expenses_${activeExpense}`]}
                userName={userName}
                isAdmin={isAdmin}
                onSave={saveComment}
                onDelete={deleteComment}
                globalUsers={globalUsers}
                onSaveTask={saveTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                label={`Plan de Acción (${activeExpense.charAt(0).toUpperCase() + activeExpense.slice(1)})`}
              />
            </div>
          </div>

        </div>
      </main>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden flex">
          <div className="bg-white w-64 h-full shadow-xl flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">INDUWELL</h1>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-500">
                <X />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 py-4 space-y-1">
              {navItems}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-outfit">Panel de Administración de Usuarios</h2>
              <button onClick={() => setShowAdminPanel(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-slate-50 dark:bg-[#0B0F19] p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Crear Nuevo Usuario</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  placeholder="Usuario" 
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="flex-1 text-sm p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-white"
                />
                <input 
                  type="text" 
                  placeholder="Contraseña" 
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  className="flex-1 text-sm p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-white"
                />
                <select 
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value)}
                  className="text-sm p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-white"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
                <button onClick={createNewUser} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Crear</button>
              </div>
              {createUserError && <p className="text-rose-500 text-xs mt-2">{createUserError}</p>}
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-3">
                {usersList.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No hay usuarios registrados aún.</p>
                ) : (
                  usersList.map((user, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-medium text-sm ${user.is_banned ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                            {user.username}
                          </span>
                          <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
                        </div>
                        {user.is_banned && (
                          <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">BLOQUEADO</span>
                        )}
                      </div>
                      <button 
                        onClick={() => toggleUserBan(user.username, user.is_banned)}
                        disabled={user.username === userName}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          user.is_banned 
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300' 
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20'
                        }`}
                      >
                        {user.is_banned ? 'Desbloquear' : 'Bloquear Acceso'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-outfit">Identidad de Usuario</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Por favor ingresa tu nombre para participar en los análisis de Induwell.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={loginNameInput}
                  onChange={(e) => setLoginNameInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej. Miguel Mendez"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
                <input 
                  type="password" 
                  value={loginPasswordInput}
                  onChange={(e) => { setLoginPasswordInput(e.target.value); setPinError(false); }}
                  className={`w-full bg-slate-50 dark:bg-[#0B0F19] border ${pinError ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'} rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none`}
                  placeholder="Tu contraseña..."
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              
              <button 
                onClick={handleLogin}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors mt-2"
              >
                Ingresar
              </button>
              {loginError && <p className="text-rose-500 text-sm text-center mt-2 font-medium">{loginError}</p>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
