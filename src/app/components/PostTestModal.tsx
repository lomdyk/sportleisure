import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLang } from '../utils/i18n';
import { GhostButton } from './ui/GhostButton';

interface PostTestModalProps {
  onSubmit: (userFeelings: string[], biologyCheck: string, knowledgeCheck: string, foodCheck: string, sportsCheck: string, feedback: string, learnedNew: string) => void;
  onClose: () => void;
}

export const PostTestModal: React.FC<PostTestModalProps> = ({ onSubmit, onClose }) => {
  const { t } = useLang();
  const [userFeelings, setUserFeelings] = useState<string[]>([]);
  const [biologyCheck, setBiologyCheck] = useState<string>('');
  const [knowledgeCheck, setKnowledgeCheck] = useState<string>('');
  const [foodCheck, setFoodCheck] = useState<string>('');
  const [sportsCheck, setSportsCheck] = useState<string>('');
  const [learnedNew, setLearnedNew] = useState<string>('');
  const [feedback, setFeedback] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userFeelings.length > 0 && biologyCheck && knowledgeCheck && foodCheck && sportsCheck && learnedNew) {
      setIsSubmitting(true);
      await onSubmit(userFeelings, biologyCheck, knowledgeCheck, foodCheck, sportsCheck, feedback, learnedNew);
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
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel relative z-10 w-full max-w-xl p-4 sm:p-6 md:p-8 shadow-[0_0_50px_rgba(52,211,153,0.1)] my-auto"
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
                  {t("posttest.feelings")}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'immersed', label: t("posttest.feel.immersed") },
                    { id: 'confident', label: t("posttest.feel.confident") },
                    { id: 'inspired', label: t("posttest.feel.inspired") },
                    { id: 'motivated', label: t("posttest.feel.motivated") },
                  ].map((opt) => {
                    const isSelected = userFeelings.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setUserFeelings(userFeelings.filter(id => id !== opt.id));
                          } else {
                            setUserFeelings([...userFeelings, opt.id]);
                          }
                        }}
                        className={`py-2.5 px-4 text-sm font-medium transition-all duration-300 text-left flex items-center justify-between ${
                          isSelected
                            ? 'border rounded-2xl border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                            : 'glass-button text-slate-300'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-500'
                        }`}>
                          {isSelected && <span className="text-xs">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                           <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  {t("posttest.biology")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'brain', label: t("posttest.bio.brain") },
                    { id: 'stomach', label: t("posttest.bio.stomach") },
                    { id: 'weight', label: t("posttest.bio.weight") },
                    { id: 'muscle', label: t("posttest.bio.muscle") }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBiologyCheck(opt.id)}
                      className={`py-2.5 px-4 text-sm font-medium transition-all duration-300 text-left ${
                        biologyCheck === opt.id
                          ? 'border rounded-2xl border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                          : 'glass-button text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  {t("posttest.knowledge")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'sugar', label: t("posttest.k.sugar") },
                    { id: 'protein', label: t("posttest.k.protein") },
                    { id: 'gluten', label: t("posttest.k.gluten") },
                    { id: 'dk', label: t("posttest.k.dk") }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setKnowledgeCheck(opt.id)}
                      className={`py-2.5 px-4 text-sm font-medium transition-all duration-300 text-left ${
                        knowledgeCheck === opt.id
                          ? 'border rounded-2xl border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                          : 'glass-button text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  {t("posttest.food")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'apple', label: t("posttest.food.apple") },
                    { id: 'cheese', label: t("posttest.food.cheese") },
                    { id: 'nuts', label: t("posttest.food.nuts") },
                    { id: 'milk', label: t("posttest.food.milk") }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFoodCheck(opt.id)}
                      className={`py-2.5 px-4 text-sm font-medium transition-all duration-300 text-left ${
                        foodCheck === opt.id
                          ? 'border rounded-2xl border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                          : 'glass-button text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  {t("posttest.sports")}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'spike', label: t("posttest.sp.spike") },
                    { id: 'formula', label: t("posttest.sp.formula") },
                    { id: 'low_intensity', label: t("posttest.sp.low") },
                    { id: 'sugar', label: t("posttest.sp.sugar") }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSportsCheck(opt.id)}
                      className={`py-2.5 px-4 text-sm font-medium transition-all duration-300 text-left ${
                        sportsCheck === opt.id
                          ? 'border rounded-2xl border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                          : 'glass-button text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  {t("posttest.formula")}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'breakdown', label: t("posttest.f.breakdown") },
                    { id: 'tyrosine', label: t("posttest.f.amino") },
                    { id: 'energy', label: t("posttest.f.energy") },
                    { id: 'cure', label: t("posttest.f.cure") }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLearnedNew(opt.id)}
                        className={`py-2.5 px-4 text-sm font-medium transition-all duration-300 text-left ${
                          learnedNew === opt.id
                            ? 'border rounded-2xl border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                            : 'glass-button text-slate-300'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>   </div>

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
                  disabled={userFeelings.length === 0 || !biologyCheck || !knowledgeCheck || !foodCheck || !sportsCheck || !learnedNew || isSubmitting}
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
