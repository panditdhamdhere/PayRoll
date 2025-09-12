'use client';

import { useMemo, useState } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { useDAOContract } from '@/hooks/useDAOContract';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { toast } from 'sonner';

export function DAOView() {
  const { address } = useAccount();
  const { employeeAllocations, claimTokens, createTokenAllocation, allocateToEmployee } = useDAOContract();

  const [allocationIdInput, setAllocationIdInput] = useState('');

  const DAO_ABI_MIN = useMemo(
    () => (
      [
        {
          name: 'getClaimableAmount',
          type: 'function',
          stateMutability: 'view',
          inputs: [
            { name: 'employee', type: 'address' },
            { name: 'allocationId', type: 'uint256' },
          ],
          outputs: [{ name: 'claimableAmount', type: 'uint256' }],
        },
      ] as const
    ),
    []
  );

  const allocationIds: bigint[] = useMemo(() => {
    if (!employeeAllocations) return [];
    try {
      return employeeAllocations as unknown as bigint[];
    } catch {
      return [];
    }
  }, [employeeAllocations]);

  const claimablesRead = useReadContracts({
    allowFailure: true,
    contracts:
      address && allocationIds.length > 0
        ? allocationIds.map((id) => ({
            address: CONTRACT_ADDRESSES.DAO_DISTRIBUTION as `0x${string}`,
            abi: DAO_ABI_MIN,
            functionName: 'getClaimableAmount',
            args: [address, id],
          }))
        : [],
    query: { enabled: !!address && allocationIds.length > 0, refetchInterval: 10000 },
  });

  const displayAllocations = useMemo(() => {
    return allocationIds.map((id, idx) => ({
      id: Number(id),
      claimable: (claimablesRead.data?.[idx] as any)?.result ?? 0n,
    }));
  }, [allocationIds, claimablesRead.data]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">DAO Governance</h2>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Your Token Allocations</h3>
        <div className="space-y-4">
          {displayAllocations.map((allocation) => (
            <div key={allocation.id} className="rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold">Allocation #{allocation.id}</h4>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${allocation.claimable > 0n ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {allocation.claimable > 0n ? 'Claimable' : 'Vesting'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-black dark:text-gray-600">Claimable Now</p>
                  <p className="font-semibold text-green-600">{typeof allocation.claimable === 'bigint' ? (Number(allocation.claimable) / 1e18).toFixed(6) : allocation.claimable}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-black dark:text-gray-600">
                  <p>Holder: {address}</p>
                </div>
                <button
                  disabled={allocation.claimable === 0n}
                  className={`px-4 py-2 rounded-lg transition-colors ${allocation.claimable > 0n ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg font-medium' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40`}
                  onClick={async () => {
                    try {
                      toast.loading(`Claiming allocation #${allocation.id}...`, { id: `dao-claim-${allocation.id}` });
                      await claimTokens(BigInt(allocation.id));
                      toast.success(`Claimed allocation #${allocation.id}`, { id: `dao-claim-${allocation.id}` });
                    } catch (err: any) {
                      toast.error(err?.shortMessage || err?.message || `Failed to claim #${allocation.id}`, { id: `dao-claim-${allocation.id}` });
                    }
                  }}
                >
                  Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-3">
          <input
            value={allocationIdInput}
            onChange={(e) => setAllocationIdInput(e.target.value.replace(/\D/g, ''))}
            placeholder="Allocation ID"
            className="px-3 py-2 rounded-lg text-sm w-40 border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40 shadow-lg font-medium"
            disabled={!allocationIdInput}
            onClick={async () => {
              try {
                toast.loading(`Claiming allocation #${allocationIdInput}...`, { id: 'dao-claim-input' });
                await claimTokens(BigInt(allocationIdInput));
                toast.success(`Claimed allocation #${allocationIdInput}`, { id: 'dao-claim-input' });
              } catch (err: any) {
                toast.error(err?.shortMessage || err?.message || 'Claim failed', { id: 'dao-claim-input' });
              }
            }}
          >
            Claim by ID
          </button>
        </div>
      </div>
    </div>
  );
}
