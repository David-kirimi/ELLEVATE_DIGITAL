import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl ${
                type === 'danger' ? 'bg-red-50 text-red-500' : 
                type === 'warning' ? 'bg-orange-50 text-orange-500' : 
                'bg-blue-50 text-blue-500'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{message}</p>
          </div>

          <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-4 rounded-2xl font-bold text-white transition-all shadow-lg hover:shadow-xl ${
                type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 
                type === 'warning' ? 'bg-orange-500 hover:bg-orange-600' : 
                'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
