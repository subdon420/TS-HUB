import React, { createContext, useContext, useState } from 'react';
import confetti from 'canvas-confetti';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const triggerConfetti = () => {
    // Multi-stage confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06B6D4', '#10B981', '#8B5CF6', '#F59E0B']
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#06B6D4', '#10B981']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#8B5CF6', '#6366F1']
        });
      }, 250);
    } catch (e) {
      console.log('Confetti trigger:', e);
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, triggerConfetti }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                : toast.type === 'cyber'
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200 shadow-neon-cyan'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex-1 leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

