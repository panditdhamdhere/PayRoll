'use client';

import { useState } from 'react';
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
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {address?.slice(0, 6)}...{address?.slice(-4)}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'test' && <ContractTest />}
          {activeTab === 'employee' && <EmployeeView />}
          {activeTab === 'employer' && <EmployerView />}
          {activeTab === 'yield' && <YieldView />}
          {activeTab === 'dao' && <DAOView />}
        </div>
      </div>
    </div>
  );
}
