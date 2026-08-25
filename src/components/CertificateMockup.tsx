import { motion } from 'framer-motion';

export default function CertificateMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative w-full max-w-md mx-auto"
      style={{ perspective: '1200px' }}
    >
      {/* Ambient glow behind card */}
      <div className="absolute -inset-8 bg-gold-500/5 rounded-3xl blur-3xl" />
      
      {/* Certificate card */}
      <div className="relative overflow-hidden rounded-2xl border border-gold-500/20 bg-gradient-to-br from-dark-800/90 via-dark-900/95 to-dark-950 backdrop-blur-xl cert-shine">
        {/* Top accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        
        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400">
                  Verified Original
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-white tracking-tight">
                SKINVAULT™ Certificate
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500">ID</span>
              <p className="font-mono text-[11px] text-zinc-400">#SV-2026-0847</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-6" />

          {/* Tattoo preview area */}
          <div className="relative rounded-xl overflow-hidden mb-6 bg-dark-700/50 border border-zinc-800/50">
            <div className="aspect-[16/10] flex items-center justify-center relative">
              {/* Abstract tattoo illustration */}
              <svg viewBox="0 0 200 120" className="w-full h-full opacity-30" fill="none">
                <defs>
                  <linearGradient id="tattooGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#eab308" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                {/* Geometric tattoo design */}
                <circle cx="100" cy="60" r="35" stroke="url(#tattooGrad)" strokeWidth="0.8" />
                <circle cx="100" cy="60" r="25" stroke="url(#tattooGrad)" strokeWidth="0.5" />
                <circle cx="100" cy="60" r="15" stroke="url(#tattooGrad)" strokeWidth="0.5" />
                <polygon points="100,25 130,60 100,95 70,60" stroke="url(#tattooGrad)" strokeWidth="0.7" />
                <line x1="65" y1="60" x2="135" y2="60" stroke="url(#tattooGrad)" strokeWidth="0.5" />
                <line x1="100" y1="25" x2="100" y2="95" stroke="url(#tattooGrad)" strokeWidth="0.5" />
                <path d="M 80 40 Q 100 30, 120 40" stroke="url(#tattooGrad)" strokeWidth="0.5" />
                <path d="M 80 80 Q 100 90, 120 80" stroke="url(#tattooGrad)" strokeWidth="0.5" />
                {/* Decorative dots */}
                <circle cx="100" cy="60" r="2" fill="#eab308" opacity="0.4" />
                <circle cx="100" cy="25" r="1.5" fill="#eab308" opacity="0.3" />
                <circle cx="100" cy="95" r="1.5" fill="#eab308" opacity="0.3" />
                <circle cx="65" cy="60" r="1.5" fill="#eab308" opacity="0.3" />
                <circle cx="135" cy="60" r="1.5" fill="#eab308" opacity="0.3" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-medium">
                  Фото работы
                </span>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-[9px] uppercase tracking-[0.15em] text-zinc-500 font-medium block mb-1">Мастер</span>
              <p className="text-sm text-white font-medium">Алексей Ивлев</p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-[0.15em] text-zinc-500 font-medium block mb-1">Стиль</span>
              <p className="text-sm text-white font-medium">Geometric</p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-[0.15em] text-zinc-500 font-medium block mb-1">Дата</span>
              <p className="text-sm text-white font-medium">12.03.2026</p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-[0.15em] text-zinc-500 font-medium block mb-1">Статус</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-sm text-emerald-400 font-medium">Уникален</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-5" />

          {/* QR Code & Footer */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-[0.15em] text-zinc-500 font-medium block mb-2">QR для проверки</span>
              {/* Mini QR code */}
              <div className="w-16 h-16 rounded-lg bg-white p-1.5">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Simplified QR pattern */}
                  <rect x="0" y="0" width="100" height="100" fill="white"/>
                  {/* Position patterns */}
                  <rect x="5" y="5" width="25" height="25" fill="black"/>
                  <rect x="10" y="10" width="15" height="15" fill="white"/>
                  <rect x="13" y="13" width="9" height="9" fill="black"/>
                  
                  <rect x="70" y="5" width="25" height="25" fill="black"/>
                  <rect x="75" y="10" width="15" height="15" fill="white"/>
                  <rect x="78" y="13" width="9" height="9" fill="black"/>
                  
                  <rect x="5" y="70" width="25" height="25" fill="black"/>
                  <rect x="10" y="75" width="15" height="15" fill="white"/>
                  <rect x="13" y="78" width="9" height="9" fill="black"/>
                  
                  {/* Data cells */}
                  <rect x="35" y="5" width="5" height="5" fill="black"/>
                  <rect x="45" y="5" width="5" height="5" fill="black"/>
                  <rect x="55" y="5" width="5" height="5" fill="black"/>
                  <rect x="35" y="15" width="5" height="5" fill="black"/>
                  <rect x="50" y="15" width="5" height="5" fill="black"/>
                  <rect x="60" y="15" width="5" height="5" fill="black"/>
                  <rect x="40" y="25" width="5" height="5" fill="black"/>
                  <rect x="55" y="25" width="5" height="5" fill="black"/>
                  
                  <rect x="5" y="35" width="5" height="5" fill="black"/>
                  <rect x="15" y="35" width="5" height="5" fill="black"/>
                  <rect x="25" y="40" width="5" height="5" fill="black"/>
                  <rect x="35" y="35" width="5" height="5" fill="black"/>
                  <rect x="45" y="40" width="5" height="5" fill="black"/>
                  <rect x="55" y="35" width="5" height="5" fill="black"/>
                  <rect x="65" y="40" width="5" height="5" fill="black"/>
                  <rect x="75" y="35" width="5" height="5" fill="black"/>
                  <rect x="85" y="40" width="5" height="5" fill="black"/>
                  <rect x="90" y="35" width="5" height="5" fill="black"/>
                  
                  <rect x="5" y="50" width="5" height="5" fill="black"/>
                  <rect x="20" y="50" width="5" height="5" fill="black"/>
                  <rect x="35" y="55" width="5" height="5" fill="black"/>
                  <rect x="45" y="50" width="5" height="5" fill="black"/>
                  <rect x="60" y="55" width="5" height="5" fill="black"/>
                  <rect x="75" y="50" width="5" height="5" fill="black"/>
                  <rect x="85" y="55" width="5" height="5" fill="black"/>
                  <rect x="90" y="50" width="5" height="5" fill="black"/>
                  
                  <rect x="5" y="60" width="5" height="5" fill="black"/>
                  <rect x="15" y="60" width="5" height="5" fill="black"/>
                  <rect x="25" y="60" width="5" height="5" fill="black"/>
                  
                  <rect x="35" y="70" width="5" height="5" fill="black"/>
                  <rect x="50" y="75" width="5" height="5" fill="black"/>
                  <rect x="60" y="70" width="5" height="5" fill="black"/>
                  <rect x="70" y="80" width="5" height="5" fill="black"/>
                  <rect x="80" y="75" width="5" height="5" fill="black"/>
                  <rect x="90" y="70" width="5" height="5" fill="black"/>
                  <rect x="85" y="85" width="5" height="5" fill="black"/>
                  <rect x="75" y="90" width="5" height="5" fill="black"/>
                  <rect x="90" y="90" width="5" height="5" fill="black"/>
                </svg>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-xs font-semibold text-zinc-400 tracking-wider">SKINVAULT™</p>
              <p className="text-[9px] text-zinc-600 mt-0.5">skinvault.io/verify</p>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
      </div>
    </motion.div>
  );
}
