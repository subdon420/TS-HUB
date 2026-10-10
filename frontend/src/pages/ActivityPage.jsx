import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Code2, 
  Search, 
  Clock, 
  GitPullRequest, 
  Bug, 
  CheckCircle2, 
  Radio, 
  Sparkles,
  Terminal,
  Filter
} from 'lucide-react';
import { ActivityStream } from '../components/collaboration/ActivityStream';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';

export const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { addToast } = useToast();

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await api.getAllActivities();
      setActivities(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load activity stream from MongoDB', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Real-time socket event listener
  useEffect(() => {
    if (!socket) return;

    const handleFeed = (eventData) => {
      setActivities(prev => [
        {
          _id: 'realtime-' + Date.now(),
          action: eventData.type || 'STATUS_TRANSITION',
          message: eventData.message,
          createdAt: eventData.time || new Date(),
          user: { name: 'Real-Time Sync Engine' },
        },
        ...prev
      ]);
      addToast(eventData.message, 'cyber');
    };

    socket.on('activity:feed', handleFeed);
    return () => {
      socket.off('activity:feed', handleFeed);
    };
  }, [socket]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-7 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
              <Activity size={20} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Real-Time Collaboration & Audit Stream
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Live event logs separated for QA Testers and Software Developers with WebSocket push notifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <Radio size={13} className="text-emerald-400" />
            <span>WebSocket Live</span>
          </span>
          <button
            onClick={fetchActivities}
            className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            Refresh Feed
          </button>
        </div>
      </div>

      {/* Main Activity Stream with Role Tabs */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-3" />
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Syncing activity records...</span>
        </div>
      ) : (
        <ActivityStream activities={activities} />
      )}
    </div>
  );
};

