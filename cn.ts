@import "tailwindcss";

@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;
  --color-gold-50: #fefce8;
  --color-gold-100: #fef9c3;
  --color-gold-200: #fef08a;
  --color-gold-300: #fde047;
  --color-gold-400: #facc15;
  --color-gold-500: #eab308;
  --color-gold-600: #ca8a04;
  --color-gold-700: #a16207;
  --color-gold-800: #854d0e;
  --color-gold-900: #713f12;
  --color-dark-950: #09090b;
  --color-dark-900: #0f0f13;
  --color-dark-800: #161620;
  --color-dark-700: #1e1e2e;
  --color-dark-600: #2a2a3d;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #09090b;
  color: #e4e4e7;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #09090b;
}

::-webkit-scrollbar-thumb {
  background: #2a2a3d;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3a3a5d;
}

/* Noise texture overlay */
.noise-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* Glow effects */
.glow-gold {
  box-shadow: 0 0 40px rgba(234, 179, 8, 0.15), 0 0 80px rgba(234, 179, 8, 0.05);
}

.text-gradient-gold {
  background: linear-gradient(135deg, #fde047 0%, #eab308 40%, #ca8a04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.border-gradient-gold {
  border-image: linear-gradient(135deg, #ca8a04, #eab308, #ca8a04) 1;
}

/* Pulse animation for CTA */
@keyframes pulse-gold {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.4);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(234, 179, 8, 0);
  }
}

.pulse-gold {
  animation: pulse-gold 2.5s ease-in-out infinite;
}

/* Floating animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
}

.float {
  animation: float 6s ease-in-out infinite;
}

/* Shimmer effect */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(234, 179, 8, 0.08) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

/* Certificate shine */
@keyframes cert-shine {
  0% {
    transform: translateX(-100%) rotate(25deg);
  }
  100% {
    transform: translateX(300%) rotate(25deg);
  }
}

.cert-shine::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 50%;
  height: 200%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  transform: rotate(25deg);
  animation: cert-shine 5s ease-in-out infinite;
}

/* Grid pattern */
.grid-pattern {
  background-image: 
    linear-gradient(rgba(234, 179, 8, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(234, 179, 8, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}

input::placeholder {
  color: #52525b;
}

input:focus {
  outline: none;
}
