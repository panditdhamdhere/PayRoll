'use client';

import { useMemo, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useYieldContract } from '@/hooks/useYieldContract';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { toast } from 'sonner';

export function YieldView() {
  const { address } = useAccount();
  const { deposit, withdraw } = useYieldContract();

  const [token, setToken] = useState('');
  const [amount, setAmount] = useState('');
  const [protocol, setProtocol] = useState('Aave');
  const [apy, setApy] = useState('850'); // 8.50% in basis points demo

  const YIELD_ABI_MIN = useMemo(
    () => (
      [
        {
          name: 'getTotalYield',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'token', type: 'address' }],
          outputs: [{ name: 'totalYieldAmount', type: 'uint256' }],
        },
        {
          name: 'getAvailableBalance',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'token', type: 'address' }],
          outputs: [{ name: 'availableBalance', type: 'uint256' }],
        },
      ] as const
    ),
    []
  );

  const totalYield = useReadContract({
    address: CONTRACT_ADDRESSES.YIELD_STRATEGY as `0x${string}`,
    abi: YIELD_ABI_MIN,
    functionName: 'getTotalYield',
    args: token ? [token as `0x${string}`] : undefined,
    query: { enabled: !!token, refetchInterval: 5000 },
  });

  const availableBalance = useReadContract({
    address: CONTRACT_ADDRESSES.YIELD_STRATEGY as `0x${string}`,
    abi: YIELD_ABI_MIN,
    functionName: 'getAvailableBalance',
    args: token ? [token as `0x${string}`] : undefined,
    query: { enabled: !!token, refetchInterval: 5000 },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Yield Generation</h2>
      </div>

      <div className="rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Deposit / Withdraw</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token address (0x...)"
            className="px-3 py-2 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            placeholder="Amount (wei)"
            className="px-3 py-2 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          >
            <option value="Aave">Aave</option>
            <option value="Compound">Compound</option>
            <option value="Yearn">Yearn</option>
          </select>
          <input
            value={apy}
            onChange={(e) => setApy(e.target.value.replace(/\D/g, ''))}
            placeholder="APY (bps)"
            className="px-3 py-2 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
        </div>
        <div className="mt-4 flex gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40 shadow-lg font-medium"
            disabled={!token || !amount}
            onClick={async () => {
              try {
                toast.loading('Depositing...', { id: 'deposit' });
                await deposit(token as `0x${string}`, BigInt(amount), protocol, BigInt(apy || '0'));
                toast.success('Deposit submitted', { id: 'deposit' });
              } catch (err: any) {
                toast.error(err?.shortMessage || err?.message || 'Deposit failed', { id: 'deposit' });
              }
            }}
          >
            Deposit
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40 shadow-lg font-medium"
            disabled={!token || !amount}
            onClick={async () => {
              try {
                toast.loading('Withdrawing...', { id: 'withdraw' });
                await withdraw(token as `0x${string}`, BigInt(amount));
                toast.success('Withdraw submitted', { id: 'withdraw' });
              } catch (err: any) {
                toast.error(err?.shortMessage || err?.message || 'Withdraw failed', { id: 'withdraw' });
              }
            }}
          >
            Withdraw
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg p-6 border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg">
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">Available Balance</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {token ? (availableBalance.data ? (Number(availableBalance.data as any) / 1e18).toFixed(6) : '—') : '—'}
          </p>
        </div>
        <div className="rounded-lg p-6 border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Total Yield Generated</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {token ? (totalYield.data ? (Number(totalYield.data as any) / 1e18).toFixed(6) : '—') : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
