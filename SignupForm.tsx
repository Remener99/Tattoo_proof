import { motion } from 'framer-motion';

interface FeatureItemProps {
  text: string;
  index: number;
}

export default function FeatureItem({ text, index }: FeatureItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="flex items-center gap-4 group"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center group-hover:bg-gold-500/20 group-hover:border-gold-500/30 transition-all duration-300">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span className="text-base sm:text-lg text-zinc-300 font-medium group-hover:text-white transition-colors duration-300">
        {text}
      </span>
    </motion.div>
  );
}
