'use client';

import { useAccount, useBalance } from 'wagmi';
import { usePayrollContract } from '@/hooks/usePayrollContract';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

export function ContractTest() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { employeeStreams } = usePayrollContract();

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Contract Connection Test</h3>
      
      <div className="space-y-3">
        <div>
          <span className="font-medium">Wallet Connected:</span>
          <span className={`ml-2 px-2 py-1 rounded text-sm ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? 'Yes' : 'No'}
          </span>
        </div>
        
        {isConnected && (
          <>
            <div>
              <span className="font-medium">Address:</span>
              <span className="ml-2 font-mono text-sm">{address}</span>
            </div>
            
            <div>
              <span className="font-medium">Network:</span>
              <span className="ml-2">{chain?.name} (ID: {chain?.id})</span>
            </div>
            
            <div>
              <span className="font-medium">Balance:</span>
              <span className="ml-2">{balance?.formatted} {balance?.symbol}</span>
            </div>
            
            <div>
              <span className="font-medium">Payroll Contract:</span>
              <span className="ml-2 font-mono text-sm">
                {CONTRACT_ADDRESSES.PAYROLL_STREAM || 'Not configured'}
              </span>
            </div>
            
            <div>
              <span className="font-medium">Employee Streams:</span>
              <span className="ml-2 font-mono text-sm">
                {employeeStreams ? employeeStreams.length : 0} streams
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
