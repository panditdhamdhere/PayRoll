'use client';

import { useMemo, useState } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { usePayrollContract } from '@/hooks/usePayrollContract';
import { toast } from 'sonner';

export function EmployerView() {
  const { address } = useAccount();
  const { createStream, employerStreams, getStream, addEmployee, approveToken } = usePayrollContract();

  // Stream creation state
  const [employeeId, setEmployeeId] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  // Add employee state
  const [employeeRecipient, setEmployeeRecipient] = useState('');
  const [salaryPerSecond, setSalaryPerSecond] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [taxRecipient, setTaxRecipient] = useState('');

  const streamIds: bigint[] = useMemo(() => {
    if (!employerStreams) return [];
    try {
      return employerStreams as unknown as bigint[];
    } catch {
      return [];
    }
  }, [employerStreams]);

  // Get stream data for each stream ID using useReadContracts
  const streamData = useReadContracts({
    allowFailure: true,
    contracts: streamIds.map(id => getStream(id)),
    query: { enabled: streamIds.length > 0 },
  });

  const displayStreams = useMemo(() => {
    return streamIds.map((id, idx) => {
      const streamResult = streamData.data?.[idx];
      const stream = streamResult && 'result' in streamResult 
        ? streamResult.result as [bigint, bigint, bigint, bigint, boolean, `0x${string}`, `0x${string}`]
        : undefined;
      
      return {
        id: Number(id),
        token: stream ? stream[5] : '—',
        totalAmount: stream ? stream[0] : BigInt(0),
        remainingAmount: stream ? stream[1] : BigInt(0),
        startTime: stream ? Number(stream[2]) : 0,
        endTime: stream ? Number(stream[3]) : 0,
        isActive: stream ? stream[4] : false,
      };
    });
  }, [streamIds, streamData.data]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Employee Management</h2>
      </div>

      {/* Add Employee Section */}
      <div className="rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-gray-700 mb-2">Employee Address</label>
            <input
              value={employeeRecipient}
              onChange={(e) => setEmployeeRecipient(e.target.value)}
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-gray-700 mb-2">Salary Per Second (wei)</label>
            <input
              value={salaryPerSecond}
              onChange={(e) => setSalaryPerSecond(e.target.value.replace(/\D/g, ''))}
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="1000000000000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-gray-700 mb-2">Start Time (Unix timestamp)</label>
            <input
              value={startTime}
              onChange={(e) => setStartTime(e.target.value.replace(/\D/g, ''))}
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="1735689600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-gray-700 mb-2">End Time (Unix timestamp)</label>
            <input
              value={endTime}
              onChange={(e) => setEndTime(e.target.value.replace(/\D/g, ''))}
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="1767225600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-gray-700 mb-2">Tax Rate (basis points)</label>
            <input
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value.replace(/\D/g, ''))}
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="2500 (25%)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-gray-700 mb-2">Tax Recipient Address</label>
            <input
              value={taxRecipient}
              onChange={(e) => setTaxRecipient(e.target.value)}
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="0x..."
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3 flex-wrap">
          <button
            className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40 shadow-lg font-medium text-sm"
            onClick={() => {
              const now = Math.floor(Date.now() / 1000);
              const oneYearLater = now + (365 * 24 * 60 * 60);
              setStartTime(now.toString());
              setEndTime(oneYearLater.toString());
            }}
          >
            Set Current Time
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40 shadow-lg font-medium text-sm"
            onClick={() => {
              setTaxRate('2500'); // 25%
              setTaxRecipient(address || '');
            }}
          >
            Set Default Tax (25%)
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40 shadow-lg font-medium"
            disabled={!employeeRecipient || !salaryPerSecond || !startTime || !endTime || !taxRate || !taxRecipient}
            onClick={async () => {
              try {
                toast.loading('Adding employee...', { id: 'add-employee' });
                console.log('Adding employee with:', { employeeRecipient, salaryPerSecond, startTime, endTime, taxRate, taxRecipient });
                await addEmployee(
                  employeeRecipient as `0x${string}`,
                  BigInt(salaryPerSecond),
                  BigInt(startTime),
                  BigInt(endTime),
                  BigInt(taxRate),
                  taxRecipient as `0x${string}`
                );
                toast.success('Employee added successfully!', { id: 'add-employee' });
                // Reset form
                setEmployeeRecipient('');
                setSalaryPerSecond('');
                setStartTime('');
                setEndTime('');
                setTaxRate('');
                setTaxRecipient('');
              } catch (err: unknown) {
                console.error('Add employee error:', err);
                const error = err as { shortMessage?: string; message?: string; details?: string };
                const errorMessage = error?.shortMessage || error?.message || error?.details || 'Failed to add employee';
                toast.error(`Add employee failed: ${errorMessage}`, { id: 'add-employee' });
              }
            }}
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Create Stream Section */}
      <div className="rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Create New Salary Stream</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-gray-700 mb-2">Employee ID</label>
            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, ''))}
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="e.g. 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-gray-700 mb-2">Token Address</label>
            <input
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-gray-700 mb-2">Total Amount (wei)</label>
            <input
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value.replace(/\D/g, ''))}
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="1000000000000000000"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3 flex-wrap">
          <button
            className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40 shadow-lg font-medium text-sm"
            onClick={() => {
              setTokenAddress('0x036CbD53842c5426634e7929541eC2318f3dCF7e'); // USDC on Base Sepolia
            }}
          >
            Use USDC
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40 shadow-lg font-medium text-sm"
            onClick={() => {
              setTotalAmount('1000000000000000000'); // 1 token in wei
            }}
          >
            Set 1 Token
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40 shadow-lg font-medium text-sm"
            disabled={!tokenAddress || !totalAmount}
            onClick={async () => {
              try {
                toast.loading('Approving token...', { id: 'approve-token' });
                console.log('Approving token:', { tokenAddress, totalAmount });
                await approveToken(tokenAddress as `0x${string}`, BigInt(totalAmount));
                toast.success('Token approved successfully!', { id: 'approve-token' });
              } catch (err: unknown) {
                console.error('Approve token error:', err);
                const error = err as { shortMessage?: string; message?: string; details?: string };
                const errorMessage = error?.shortMessage || error?.message || error?.details || 'Failed to approve token';
                toast.error(`Approve token failed: ${errorMessage}`, { id: 'approve-token' });
              }
            }}
          >
            Approve Token
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40 shadow-lg font-medium"
            disabled={!employeeId || !tokenAddress || !totalAmount}
            onClick={async () => {
              try {
                toast.loading('Creating stream...', { id: 'create-stream' });
                console.log('Creating stream with:', { employeeId, tokenAddress, totalAmount });
                await createStream(BigInt(employeeId), tokenAddress as `0x${string}`, BigInt(totalAmount));
                toast.success('Stream created successfully!', { id: 'create-stream' });
                // Reset form
                setEmployeeId('');
                setTokenAddress('');
                setTotalAmount('');
              } catch (err: unknown) {
                console.error('Create stream error:', err);
                const error = err as { shortMessage?: string; message?: string; details?: string };
                const errorMessage = error?.shortMessage || error?.message || error?.details || 'Failed to create stream';
                toast.error(`Create stream failed: ${errorMessage}`, { id: 'create-stream' });
              }
            }}
          >
            Create Stream
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Your Active Streams</h3>
        <div className="space-y-3">
          {displayStreams.map((stream) => (
            <div key={stream.id} className="rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">Stream #{stream.id}</h4>
                  <p className="text-sm text-black dark:text-gray-600">Token: {stream.token}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${stream.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                  {stream.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-black dark:text-gray-600">Total Amount:</span>
                  <span className="font-medium">{typeof stream.totalAmount === 'bigint' ? (Number(stream.totalAmount) / 1e18).toFixed(6) : stream.totalAmount} </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black dark:text-gray-600">Remaining:</span>
                  <span className="font-medium">{typeof stream.remainingAmount === 'bigint' ? (Number(stream.remainingAmount) / 1e18).toFixed(6) : stream.remainingAmount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
