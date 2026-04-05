import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white',
    info: 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/20 text-white'
  };

  const iconColors = {
    danger: 'text-rose-500 bg-rose-50',
    warning: 'text-amber-500 bg-amber-50',
    info: 'text-primary-500 bg-primary-50'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className={`p-3 rounded-2xl ${iconColors[variant]}`}>
                <AlertTriangle size={24} />
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
              {title}
            </h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              {message}
            </p>
          </div>
          
          <div className="p-6 bg-slate-50 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all ${colors[variant]}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
