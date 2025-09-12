'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useTheme } from 'next-themes';

export function Header() {
  const { isConnected } = useAccount();
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
          <a href="#" className="flex items-center gap-2 min-w-0">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
              <span className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
              <span className="relative z-10 flex h-full w-full items-center justify-center text-white font-bold text-sm">DP</span>
            </div>
            <span className="text-[1.05rem] md:text-xl font-extrabold tracking-tight truncate max-w-[50vw] md:max-w-none">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Decentralized Payroll</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-5">
            <a href="#features" className="font-extrabold" style={{ color: (resolvedTheme ?? theme) === 'dark' ? 'white' : 'black' }}>Features</a>
            <a href="#how-it-works" className="font-extrabold" style={{ color: (resolvedTheme ?? theme) === 'dark' ? 'white' : 'black' }}>How it Works</a>
            <a href="#docs" className="font-extrabold" style={{ color: (resolvedTheme ?? theme) === 'dark' ? 'white' : 'black' }}>Docs</a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme((resolvedTheme ?? theme) === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 rounded-md border border-gray-300/60 dark:border-gray-700/60 flex items-center justify-center text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5"
            >
              {(resolvedTheme ?? theme) === 'dark' ? '🌙' : '☀️'}
            </button>
            <div className="scale-95 sm:scale-100">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
