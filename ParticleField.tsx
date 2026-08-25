import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function getTimeRemaining() {
  const target = new Date();
  target.setDate(target.getDate() + 6 * 7); // 6 weeks from now
  target.setHours(0, 0, 0, 0);
  
  const now = new Date().getTime();
  const diff = target.getTime() - now;
  
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function TimerBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-xl bg-dark-800/80 border border-zinc-800/50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 to-transparent" />
        <span className="font-display text-2xl sm:text-3xl font-bold text-white relative z-10">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const [time, setTime] = useState(getTimeRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="flex items-center justify-center gap-3 sm:gap-4"
    >
      <TimerBlock value={time.days} label="Дней" />
      <span className="text-xl text-zinc-600 font-light mt-[-20px]">:</span>
      <TimerBlock value={time.hours} label="Часов" />
      <span className="text-xl text-zinc-600 font-light mt-[-20px]">:</span>
      <TimerBlock value={time.minutes} label="Минут" />
      <span className="text-xl text-zinc-600 font-light mt-[-20px]">:</span>
      <TimerBlock value={time.seconds} label="Секунд" />
    </motion.div>
  );
}
