'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { EmployeeView } from './EmployeeView';
import { EmployerView } from './EmployerView';
import { YieldView } from './YieldView';
import { DAOView } from './DAOView';
import { ContractTest } from './ContractTest';

export function Dashboard() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState('employee');

  const tabs = [
    { id: 'test', label: 'Test', icon: '🔧' },
    { id: 'employee', label: 'Employee', icon: '👤' },
    { id: 'employer', label: 'Employer', icon: '🏢' },
    { id: 'yield', label: 'Yield', icon: '📈' },
    { id: 'dao', label: 'DAO', icon: '🗳️' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <motion.h1 layout className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-black dark:text-white">
          Dashboard
        </motion.h1>
        <motion.p layout className="text-gray-800 dark:text-gray-300">
          Welcome back, {address?.slice(0, 6)}...{address?.slice(-4)}
        </motion.p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-transparent p-[1px] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)]">
        <div className="relative rounded-2xl border border-white/20 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl">
          <div className="px-4 pt-4">
            <nav className="relative flex items-center gap-2 sm:gap-4 md:gap-6">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative py-2.5 px-3 rounded-md text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                    {isActive && (
                      <motion.span
                        layoutId="tab-underline"
                        className="absolute left-1 right-1 -bottom-0.5 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'test' && (
                <motion.div key="test" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <ContractTest />
                </motion.div>
              )}
              {activeTab === 'employee' && (
                <motion.div key="employee" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <EmployeeView />
                </motion.div>
              )}
              {activeTab === 'employer' && (
                <motion.div key="employer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <EmployerView />
                </motion.div>
              )}
              {activeTab === 'yield' && (
                <motion.div key="yield" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <YieldView />
                </motion.div>
              )}
              {activeTab === 'dao' && (
                <motion.div key="dao" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <DAOView />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
