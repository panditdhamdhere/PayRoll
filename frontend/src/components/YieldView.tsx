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

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Deposit / Withdraw</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token address (0x...)"
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            placeholder="Amount (wei)"
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="Aave">Aave</option>
            <option value="Compound">Compound</option>
            <option value="Yearn">Yearn</option>
          </select>
          <input
            value={apy}
            onChange={(e) => setApy(e.target.value.replace(/\D/g, ''))}
            placeholder="APY (bps)"
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <div className="mt-4 flex gap-3">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Available Balance</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {token ? (availableBalance.data ? (Number(availableBalance.data as any) / 1e18).toFixed(6) : '—') : '—'}
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total Yield Generated</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {token ? (totalYield.data ? (Number(totalYield.data as any) / 1e18).toFixed(6) : '—') : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
