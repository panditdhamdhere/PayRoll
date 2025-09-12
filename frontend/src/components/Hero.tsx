'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

export function Hero() {
  const { theme, resolvedTheme } = useTheme();
  
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute -top-32 right-[-10%] h-[480px] w-[480px] rounded-full bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-pink-500/30 blur-3xl" />
      <div className="max-w-5xl mx-auto px-4 text-center relative">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
        >
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Decentralized Payroll, Reimagined
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10"
          style={{ color: (resolvedTheme ?? theme) === 'dark' ? 'white' : 'black' }}
        >
          Stream salaries by the second with automatic tax withholding, DeFi yield on idle funds, and DAO governance—all in one secure protocol.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <ConnectButton />
          <a href="#features" className="px-6 py-3 rounded-lg border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-white/80 dark:hover:bg-white/15 transition-colors">
            Learn More
          </a>
        </motion.div>
      </div>
    </section>
  );
}
