import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import ParticleField from './components/ParticleField';
import CertificateMockup from './components/CertificateMockup';
import CountdownTimer from './components/CountdownTimer';
import SignupForm from './components/SignupForm';
import FeatureItem from './components/FeatureItem';

const features = [
  'Оригинальный эскиз',
  'Имя мастера',
  'Подтверждение уникальности',
  'Фото готовой работы',
  'QR-код для проверки',
];

function SpotsCounter() {
  const [spots] = useState(73);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl border border-gold-500/15 bg-gradient-to-r from-dark-800/60 via-dark-800/40 to-dark-800/60 backdrop-blur-sm p-6 sm:p-8"
    >
      <div className="absolute inset-0 shimmer" />
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse" />
            <span className="text-sm sm:text-base text-zinc-300 font-medium">
              Первые <span className="text-gold-400 font-bold">100</span> сертификатов — бесплатно
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-dark-950/50 border border-zinc-800/50">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Осталось:</span>
          <span className="font-display text-lg font-bold text-gold-400">{spots}</span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="relative mt-4 h-1.5 rounded-full bg-dark-950/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${((100 - spots) / 100) * 100}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-600 to-gold-400"
        />
      </div>
    </motion.div>
  );
}

function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex items-center gap-2"
    >
      <div className="relative">
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="36" height="36" rx="8" stroke="#eab308" strokeWidth="1.5" fill="none" />
          <path d="M12 28V18C12 14.6863 14.6863 12 18 12H22C25.3137 12 28 14.6863 28 18V28" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="20" cy="20" r="4" stroke="#eab308" strokeWidth="1.5" />
          <line x1="20" y1="16" x2="20" y2="12" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span className="font-display text-lg font-bold tracking-[0.1em] text-white">
        SKINVAULT<span className="text-gold-500">™</span>
      </span>
    </motion.div>
  );
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Noise overlay */}
      <div className="noise-overlay" />
      
      {/* Particle field background */}
      <ParticleField />

      {/* Ambient gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gold-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-700/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold-600/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Sticky header */}
      <motion.header
        style={{ opacity: headerOpacity }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-dark-950/80 backdrop-blur-xl border-b border-zinc-800/30'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <a
            href="#signup"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-semibold hover:bg-gold-500/20 hover:border-gold-500/30 transition-all duration-300"
          >
            Получить сертификат
          </a>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="relative z-10">
        {/* ═══════════════════ HERO ═══════════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 grid-pattern">
          {/* Top brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-10"
          >
            <Logo />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-700/60 border border-zinc-700/40 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Скоро запуск
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl"
          >
            <span className="block font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-3">
              Твоя татуировка —
            </span>
            <span className="block font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-gradient-gold mb-3">
              единственная в мире.
            </span>
            <span className="block font-display text-lg sm:text-xl md:text-2xl font-medium text-zinc-400 mt-4">
              И скоро это можно будет доказать.
            </span>
          </motion.h1>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Scroll</span>
              <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
                <rect x="1" y="1" width="14" height="22" rx="7" stroke="#3f3f46" strokeWidth="1.5" />
                <motion.circle
                  animate={{ cy: [8, 14, 8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  cx="8"
                  cy="8"
                  r="2"
                  fill="#eab308"
                />
              </svg>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════════════ ABOUT ═══════════════════ */}
        <section className="relative py-20 sm:py-32 px-6">
          <div className="max-w-3xl mx-auto">
            {/* Section divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent mb-16 sm:mb-20"
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold-500 font-semibold mb-4">
                О проекте
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-snug max-w-2xl mx-auto">
                Мы создаём цифровые сертификаты для{' '}
                <span className="text-gradient-gold">уникальных</span> татуировок
              </h2>
              <p className="mt-5 text-zinc-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                Каждая татуировка — произведение искусства. SKINVAULT защищает авторство мастера
                и подтверждает уникальность твоей работы.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-zinc-500 font-semibold">
                Что внутри сертификата
              </span>
            </motion.div>

            <div className="space-y-4 sm:space-y-5">
              {features.map((feature, i) => (
                <FeatureItem key={i} text={feature} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ CERTIFICATE MOCKUP ═══════════════════ */}
        <section className="relative py-20 sm:py-32 px-6">
          <div className="max-w-3xl mx-auto">
            {/* Section divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent mb-16 sm:mb-20"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold-500 font-semibold mb-4">
                Пример
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Так выглядит сертификат
              </h2>
            </motion.div>

            <div className="float">
              <CertificateMockup />
            </div>
          </div>
        </section>

        {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
        <section className="relative py-20 sm:py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent mb-16 sm:mb-20"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-14 sm:mb-16"
            >
              <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold-500 font-semibold mb-4">
                Как это работает
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Три шага до сертификата
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  step: '01',
                  title: 'Загрузи эскиз',
                  desc: 'Мастер или клиент загружает оригинальный эскиз и фото готовой работы.',
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Верификация',
                  desc: 'Мы проверяем уникальность дизайна и подтверждаем авторство мастера.',
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: 'Получи сертификат',
                  desc: 'Цифровой сертификат с QR-кодом — делись им и подтверждай уникальность.',
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  viewport={{ once: true }}
                  className="group relative rounded-2xl border border-zinc-800/50 bg-dark-800/30 p-6 sm:p-8 hover:border-gold-500/20 hover:bg-dark-800/50 transition-all duration-500"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="font-display text-3xl font-bold text-gold-500/20 group-hover:text-gold-500/40 transition-colors">
                        {item.step}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center mb-4 group-hover:bg-gold-500/15 transition-colors">
                      {item.icon}
                    </div>
                    <h3 className="font-display text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ CTA / SIGNUP ═══════════════════ */}
        <section id="signup" className="relative py-20 sm:py-32 px-6">
          <div className="max-w-3xl mx-auto">
            {/* Section divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent mb-16 sm:mb-20"
            />

            {/* CTA content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-12"
            >
              <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold-500 font-semibold mb-4">
                Присоединяйся
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-snug mb-3">
                Хочешь получить сертификат
                <br />
                для своей тату?
              </h2>
              <p className="text-zinc-400 text-base sm:text-lg max-w-md mx-auto">
                Оставь Telegram — мы напишем, когда запустимся.
              </p>
            </motion.div>

            {/* Form */}
            <div className="mb-12 sm:mb-16">
              <SignupForm />
            </div>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-12"
            >
              <p className="text-sm sm:text-base text-zinc-500 mb-6 font-medium">
                До запуска осталось:
              </p>
              <CountdownTimer />
            </motion.div>

            {/* Spots counter */}
            <SpotsCounter />
          </div>
        </section>

        {/* ═══════════════════ FOOTER ═══════════════════ */}
        <footer className="relative py-12 sm:py-16 px-6 border-t border-zinc-800/30">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                  <rect x="2" y="2" width="36" height="36" rx="8" stroke="#52525b" strokeWidth="1.5" />
                  <path d="M12 28V18C12 14.6863 14.6863 12 18 12H22C25.3137 12 28 14.6863 28 18V28" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="20" cy="20" r="4" stroke="#52525b" strokeWidth="1.5" />
                  <line x1="20" y1="16" x2="20" y2="12" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="font-display text-sm font-semibold tracking-[0.1em] text-zinc-600">
                  SKINVAULT™
                </span>
              </div>
              <p className="text-xs text-zinc-700">
                © 2026 SKINVAULT. Все права защищены.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
