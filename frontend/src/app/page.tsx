'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div>
      <Header />
      {!isConnected ? (
        <div className="container mx-auto px-4 py-16">
          <Hero />
          <Features />
        </div>
      ) : (
        <Dashboard />
      )}
    </div>
  );
}