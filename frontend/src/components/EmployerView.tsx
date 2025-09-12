'use client';

import { useMemo, useState } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { usePayrollContract } from '@/hooks/usePayrollContract';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { toast } from 'sonner';

export function EmployerView() {
  const { address } = useAccount();
  const { createStream } = usePayrollContract();

  const [employeeId, setEmployeeId] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const PAYROLL_ABI_MIN = useMemo(
    () => (
      [
        {
          name: 'getEmployerStreams',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'employer', type: 'address' }],
          outputs: [{ name: 'streamIds', type: 'uint256[]' }],
        },
        {
          name: 'streams',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'streamId', type: 'uint256' }],
          outputs: [
            { name: 'totalAmount', type: 'uint256' },
            { name: 'remainingAmount', type: 'uint256' },
            { name: 'startTime', type: 'uint256' },
            { name: 'endTime', type: 'uint256' },
            { name: 'isActive', type: 'bool' },
            { name: 'token', type: 'address' },
            { name: 'employer', type: 'address' },
          ],
        },
      ] as const
    ),
    []
  );

  const employerStreamsRead = useReadContracts({
    allowFailure: true,
    contracts: address
      ? [
          {
            address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
            abi: PAYROLL_ABI_MIN,
            functionName: 'getEmployerStreams',
            args: [address],
          },
        ]
      : [],
    query: { enabled: !!address },
  });

  const streamIds: bigint[] = useMemo(() => {
    const r = employerStreamsRead.data?.[0] as any;
    return (r && 'result' in r ? (r.result as bigint[]) : []) || [];
  }, [employerStreamsRead.data]);

  const streamsRead = useReadContracts({
    allowFailure: true,
    contracts: streamIds.map((id) => ({
      address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
      abi: PAYROLL_ABI_MIN,
      functionName: 'streams',
      args: [id],
    })),
    query: { enabled: streamIds.length > 0 },
  });

  const displayStreams = useMemo(() => {
    return streamIds.map((id, idx) => {
      const r = streamsRead.data?.[idx];
      const v = (r && 'result' in (r as any) ? (r as any).result : undefined) as
        | undefined
        | [bigint, bigint, bigint, bigint, boolean, `0x${string}`, `0x${string}`];
      return {
        id: Number(id),
        token: v ? v[5] : '—',
        totalAmount: v ? v[0] : 0n,
        remainingAmount: v ? v[1] : 0n,
        startTime: v ? Number(v[2]) : 0,
        endTime: v ? Number(v[3]) : 0,
        isActive: v ? v[4] : false,
      };
    });
  }, [streamIds, streamsRead.data]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Employee Management</h2>
      </div>

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
        <div className="mt-4 flex gap-3">
          <button
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40 shadow-lg font-medium"
            disabled={!employeeId || !tokenAddress || !totalAmount}
            onClick={async () => {
              try {
                toast.loading('Creating stream...', { id: 'create-stream' });
                await createStream([BigInt(employeeId), tokenAddress as `0x${string}`, BigInt(totalAmount)]);
                toast.success('Stream created', { id: 'create-stream' });
              } catch (err: any) {
                toast.error(err?.shortMessage || err?.message || 'Failed to create stream', { id: 'create-stream' });
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
