import React, { useState } from 'react';
import { X, Copy, Check, Sparkles } from 'lucide-react';
import { NEGOTIATION_SCRIPTS } from '../../lib/negotiationScriptsData';

interface NegotiationScriptsModalProps {
  onClose: () => void;
}

export const NegotiationScriptsModal: React.FC<NegotiationScriptsModalProps> = ({ onClose }) => {
  const [activeId, setActiveId] = useState(NEGOTIATION_SCRIPTS[0].id);
  const [copied, setCopied] = useState(false);

  const activeScript = NEGOTIATION_SCRIPTS.find(s => s.id === activeId) || NEGOTIATION_SCRIPTS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeScript.script_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold text-[10px] uppercase">
              Bill Negotiation Hub
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Retention & Phone Scripts Library
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Script Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {NEGOTIATION_SCRIPTS.map(script => (
              <button
                key={script.id}
                onClick={() => setActiveId(script.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeId === script.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {script.title.split(' ')[0]} {script.title.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* Script Content Card */}
          <div className="rounded-2xl bg-slate-900 text-slate-100 p-5 space-y-3 font-mono text-xs relative">
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-sans text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Script!' : 'Copy Script'}</span>
            </button>

            <h3 className="font-sans font-extrabold text-base text-emerald-400 pr-24">
              {activeScript.title}
            </h3>
            <pre className="whitespace-pre-wrap leading-relaxed text-slate-300 font-sans">
              {activeScript.script_text}
            </pre>
          </div>

          {/* Pro Negotiation Tips */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-2">
            <h4 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Pro Negotiation Rules:</span>
            </h4>
            <ul className="space-y-1 text-amber-800 dark:text-amber-300 list-disc list-inside">
              {activeScript.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
