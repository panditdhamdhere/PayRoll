'use client';

import { useMemo, useState } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { usePayrollContract } from '@/hooks/usePayrollContract';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { toast } from 'sonner';

export function EmployeeView() {
  const { address } = useAccount();
  const { employeeStreams, claimSalary } = usePayrollContract();
  const [employeeIdInput, setEmployeeIdInput] = useState('');

  const PAYROLL_ABI_MIN = useMemo(
    () => (
      [
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
        {
          name: 'getClaimableAmount',
          type: 'function',
          stateMutability: 'view',
          inputs: [
            { name: 'employeeId', type: 'uint256' },
            { name: 'streamId', type: 'uint256' },
          ],
          outputs: [{ name: 'claimableAmount', type: 'uint256' }],
        },
      ] as const
    ),
    []
  );

  const streamIds: bigint[] = useMemo(() => {
    if (!employeeStreams) return [];
    try {
      return employeeStreams as unknown as bigint[];
    } catch {
      return [];
    }
  }, [employeeStreams]);

  const streamsRead = useReadContracts({
    allowFailure: true,
    contracts: streamIds.map((id) => ({
      address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
      abi: PAYROLL_ABI_MIN,
      functionName: 'streams',
      args: [id],
    })),
    query: {
      enabled: streamIds.length > 0,
    },
  });

  const claimablesRead = useReadContracts({
    allowFailure: true,
    contracts:
      streamIds.length > 0 && employeeIdInput
        ? streamIds.map((id) => ({
            address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
            abi: PAYROLL_ABI_MIN,
            functionName: 'getClaimableAmount',
            args: [BigInt(employeeIdInput), id],
          }))
        : [],
    query: {
      enabled: streamIds.length > 0 && employeeIdInput !== '',
      refetchInterval: 5000,
    },
  });

  const loading = streamsRead.isLoading || (employeeIdInput !== '' && claimablesRead.isLoading);

  const displayStreams = useMemo(() => {
    return streamIds.map((id, idx) => {
      const r = streamsRead.data?.[idx];
      const v = (r && 'result' in (r as any) ? (r as any).result : undefined) as
        | undefined
        | [bigint, bigint, bigint, bigint, boolean, `0x${string}`, `0x${string}`];
      const claimable = employeeIdInput && claimablesRead.data?.[idx]
        ? ((claimablesRead.data?.[idx] as any).result ?? 0n)
        : 0n;
      return {
        id: Number(id),
        employer: v ? v[6] : '—',
        token: v ? v[5] : '—',
        salaryPerSecond: '—',
        totalEarned: '—',
        claimable,
        startTime: v ? Number(v[2]) : 0,
        endTime: v ? Number(v[3]) : 0,
        isActive: v ? v[4] : false,
      };
    });
  }, [streamIds, streamsRead.data, claimablesRead.data, employeeIdInput]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Salary Streams</h2>
        <div className="flex items-center gap-3">
          <input
            value={employeeIdInput}
            onChange={(e) => setEmployeeIdInput(e.target.value.replace(/\D/g, ''))}
            placeholder="Employee ID"
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm w-36 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            disabled={!employeeIdInput || displayStreams.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={async () => {
              if (!employeeIdInput) return;
              for (const s of displayStreams) {
                try {
                  toast.loading(`Claiming stream #${s.id}...`, { id: `claim-${s.id}` });
                  await claimSalary(BigInt(employeeIdInput), BigInt(s.id));
                  toast.success(`Claimed stream #${s.id}`, { id: `claim-${s.id}` });
                } catch (err: any) {
                  toast.error(err?.shortMessage || err?.message || `Failed to claim #${s.id}`, { id: `claim-${s.id}` });
                }
              }
            }}
          >
            Claim All Available
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-semibold mb-2">Loading...</h3>
          <p className="text-gray-600">Fetching your salary streams...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {displayStreams.map((stream) => (
            <div key={stream.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Stream #{stream.id}</h3>
                  <p className="text-gray-600">Employer: {stream.employer}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${stream.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                  {stream.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Token</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{stream.token}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Salary/Second</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{stream.salaryPerSecond} {stream.token}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Earned</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{stream.totalEarned} {stream.token}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Claimable</p>
                  <p className="font-semibold text-green-600">{typeof stream.claimable === 'bigint' ? (Number(stream.claimable) / 1e18).toFixed(6) : stream.claimable} {stream.token}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>Employee ID: {employeeIdInput || '—'}</p>
                  <p>Period: {stream.startTime ? new Date(stream.startTime * 1000).toLocaleString() : '—'} to {stream.endTime ? new Date(stream.endTime * 1000).toLocaleString() : '—'}</p>
                </div>
                <button
                  disabled={!employeeIdInput || !stream.isActive}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  onClick={async () => {
                    if (!employeeIdInput) return;
                    try {
                      toast.loading(`Claiming stream #${stream.id}...`, { id: `claim-${stream.id}` });
                      await claimSalary(BigInt(employeeIdInput), BigInt(stream.id));
                      toast.success(`Claimed stream #${stream.id}`, { id: `claim-${stream.id}` });
                    } catch (err: any) {
                      toast.error(err?.shortMessage || err?.message || `Failed to claim #${stream.id}`, { id: `claim-${stream.id}` });
                    }
                  }}
                >
                  Claim {typeof stream.claimable === 'bigint' ? (Number(stream.claimable) / 1e18).toFixed(6) : stream.claimable} {stream.token}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && displayStreams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-xl font-semibold mb-2">No Active Streams</h3>
          <p className="text-gray-600">You don't have any active salary streams yet.</p>
        </div>
      )}
    </div>
  );
}
