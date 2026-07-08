import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLang } from '../utils/i18n';
import { GhostButton } from './ui/GhostButton';

interface PreTestModalProps {
  onSubmit: (age: string, knowledge: string, restrictions: string) => void;
}

export const PreTestModal: React.FC<PreTestModalProps> = ({ onSubmit }) => {
  const { t, lang, setLang } = useLang();
  const [age, setAge] = useState('');
  const [knowledge, setKnowledge] = useState('');
  const [restrictions, setRestrictions] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (age && knowledge && restrictions) {
      onSubmit(age, knowledge, restrictions);
    }
  };

  // Prevent scroll events from propagating to the body to help stop Lenis or native scrolling
  const stopScroll = (e: React.WheelEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto"
      onWheel={stopScroll}
      onTouchMove={stopScroll}
      data-lenis-prevent="true"
    >
      {/* Dark overlay backdrop */}
      <div className="fixed inset-0 bg-[#050a18]/90 backdrop-blur-xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="glass-panel relative z-10 w-full max-w-lg p-4 sm:p-6 md:p-8 shadow-[0_0_50px_rgba(34,211,238,0.1)] my-auto"
      >
        <div className="absolute top-4 right-4 flex gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-700/50">
          <button 
            type="button"
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${lang === 'en' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
          >EN</button>
          <button 
            type="button"
            onClick={() => setLang('de')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${lang === 'de' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
          >DE</button>
        </div>

        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <span className="text-2xl">🚀</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {t("pretest.title")}
        </h2>
        <p className="text-slate-400 text-center mb-6 text-sm leading-relaxed">
          {t("pretest.intro")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Age Group */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">
              {t("pretest.age")}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: '6-12', label: t("pretest.age.6_12") },
                { id: '13-17', label: t("pretest.age.13_17") },
                { id: '18-25', label: t("pretest.age.18_25") },
                { id: '26-35', label: t("pretest.age.26_35") },
                { id: '35+', label: t("pretest.age.35p") },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAge(opt.id)}
                  className={`py-2 px-1 text-xs font-medium transition-all duration-300 text-center ${
                    age === opt.id
                      ? 'border rounded-2xl border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                      : 'glass-button text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Knowledge */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">
              {t("pretest.pku")}
            </label>
            <div className="flex flex-col gap-2">
              {[
                { id: 'yes', label: t("pretest.pku.yes") },
                { id: 'heard', label: t("pretest.pku.heard") },
                { id: 'no', label: t("pretest.pku.no") },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setKnowledge(opt.id)}
                  className={`py-2.5 px-4 text-sm font-medium transition-all duration-300 text-left ${
                    knowledge === opt.id
                      ? 'border rounded-2xl border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                      : 'glass-button text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">
              {t("pretest.diet")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'yes', label: t("pretest.diet.yes") },
                { id: 'no', label: t("pretest.diet.no") },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRestrictions(opt.id)}
                  className={`py-2.5 px-4 text-sm font-medium transition-all duration-300 text-center ${
                    restrictions === opt.id
                      ? 'border rounded-2xl border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                      : 'glass-button text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[11px] text-slate-400 text-center mb-3 leading-relaxed">
              {t("pretest.note")}
            </p>
            <GhostButton
              type="submit"
              tone="cyan"
              className="w-full justify-center py-3"
              disabled={!age || !knowledge || !restrictions}
            >
              {t("pretest.start")}
            </GhostButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
