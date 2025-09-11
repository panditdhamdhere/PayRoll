'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useTheme } from 'next-themes';

export function Header() {
  const { isConnected } = useAccount();
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 dark:border-white/10">
      <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center gap-2">
              <div className="relative w-9 h-9 rounded-lg overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
                <span className="relative z-10 flex h-full w-full items-center justify-center text-white font-bold text-sm">DP</span>
              </div>
              <span className="text-lg md:text-xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Decentralized Payroll</span>
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">How it Works</a>
              <a href="#docs" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Docs</a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                aria-label="Toggle theme"
                onClick={() => setTheme((resolvedTheme ?? theme) === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-md border border-white/30 dark:border-white/10 flex items-center justify-center text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5"
              >
                {(resolvedTheme ?? theme) === 'dark' ? '🌙' : '☀️'}
              </button>
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
