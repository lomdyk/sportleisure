import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLang } from '../utils/i18n';
import { GhostButton } from './ui/GhostButton';

interface PostTestModalProps {
  onSubmit: (design: number, clarity: number, knowledgeCheck: string, empathyImpact: string, behavioralIntent: string, feedback: string) => void;
  onClose: () => void;
}

export const PostTestModal: React.FC<PostTestModalProps> = ({ onSubmit, onClose }) => {
  const { t } = useLang();
  const [designRating, setDesignRating] = useState<number>(0);
  const [clarityRating, setClarityRating] = useState<number>(0);
  const [knowledgeCheck, setKnowledgeCheck] = useState<string>('');
  const [empathyImpact, setEmpathyImpact] = useState<string>('');
  const [behavioralIntent, setBehavioralIntent] = useState<string>('');
  const [feedback, setFeedback] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (designRating && clarityRating && knowledgeCheck && empathyImpact && behavioralIntent) {
      setIsSubmitting(true);
      await onSubmit(designRating, clarityRating, knowledgeCheck, empathyImpact, behavioralIntent, feedback);
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  const renderStars = (rating: number, setRating: (val: number) => void) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              rating >= star 
                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                : 'bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-500 hover:bg-slate-700'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

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
      <div className="fixed inset-0 bg-[#050a18]/90 backdrop-blur-xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl bg-[#0a1128] border border-emerald-500/20 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(52,211,153,0.1)] my-auto"
      >
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(52,211,153,0.4)]">
              ✨
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">{t("posttest.success")}</h2>
            <p className="text-emerald-400 text-center">{t("posttest.successSub")}</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-2">
              {t("posttest.title")}
            </h2>
            <p className="text-slate-400 text-center mb-6 text-sm leading-relaxed">
              {t("posttest.intro")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  {t("posttest.design")}
                </label>
                {renderStars(designRating, setDesignRating)}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  {t("posttest.clarity")}
                </label>
                {renderStars(clarityRating, setClarityRating)}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  {t("posttest.knowledge")}
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'sugar', label: t("posttest.know.sugar") },
                    { id: 'protein', label: t("posttest.know.protein") },
                    { id: 'gluten', label: t("posttest.know.gluten") },
                    { id: 'dk', label: t("posttest.know.dk") },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setKnowledgeCheck(opt.id)}
                      className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-all duration-300 text-left ${
                        knowledgeCheck === opt.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  {t("posttest.empathy")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'yes', label: t("posttest.emp.yes") },
                    { id: 'somewhat', label: t("posttest.emp.somewhat") },
                    { id: 'no', label: t("posttest.emp.no") },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEmpathyImpact(opt.id)}
                      className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all duration-300 text-center ${
                        empathyImpact === opt.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  {t("posttest.impact")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'yes', label: t("posttest.imp.yes") },
                    { id: 'maybe', label: t("posttest.imp.maybe") },
                    { id: 'no', label: t("posttest.imp.no") },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBehavioralIntent(opt.id)}
                      className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all duration-300 text-center ${
                        behavioralIntent === opt.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  {t("posttest.feedback")}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t("posttest.placeholder")}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
                  rows={3}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <GhostButton
                  type="button"
                  onClick={onClose}
                  color="#64748b"
                  className="flex-1 justify-center py-3"
                >
                  {t("posttest.cancel")}
                </GhostButton>
                <GhostButton
                  type="submit"
                  tone="emerald"
                  className="flex-[2] justify-center py-3"
                  disabled={!designRating || !clarityRating || !knowledgeCheck || !empathyImpact || !behavioralIntent || isSubmitting}
                >
                  {isSubmitting ? '...' : t("posttest.submit")}
                </GhostButton>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};
