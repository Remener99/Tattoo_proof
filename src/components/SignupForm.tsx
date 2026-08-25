import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignupForm() {
  const [telegram, setTelegram] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (telegram.trim().length > 0) {
      setSubmitted(true);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Input wrapper */}
            <div className={`relative rounded-xl transition-all duration-300 ${focused ? 'glow-gold' : ''}`}>
              {/* Border gradient */}
              <div className={`absolute -inset-[1px] rounded-xl transition-opacity duration-300 ${focused ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  background: 'linear-gradient(135deg, #ca8a04, #eab308, #ca8a04)',
                }}
              />
              <div className="relative flex items-center bg-dark-800 rounded-xl border border-zinc-800/80 overflow-hidden"
                style={focused ? { borderColor: 'transparent' } : {}}
              >
                <span className="pl-4 sm:pl-5 text-zinc-500 text-lg select-none">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-zinc-500">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="@твой_telegram"
                  className="w-full px-3 py-4 sm:py-5 bg-transparent text-white text-base sm:text-lg font-medium border-none focus:ring-0"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full relative group overflow-hidden rounded-xl py-4 sm:py-5 px-8 font-display font-bold text-base sm:text-lg tracking-wide uppercase cursor-pointer pulse-gold"
            >
              {/* Button background */}
              <div className="absolute inset-0 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 transition-all duration-300" />
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <span className="relative z-10 text-dark-950 flex items-center justify-center gap-2">
                Хочу сертификат
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </motion.button>

            <p className="text-center text-xs text-zinc-600 mt-3">
              Никакого спама. Только уведомление о запуске.
            </p>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-5"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#09090b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
              Ты в списке!
            </h3>
            <p className="text-zinc-400 text-sm sm:text-base">
              Мы напишем тебе в Telegram, как только запустимся.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-700/50 border border-zinc-800/50">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-zinc-400">Зарегистрировано</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
