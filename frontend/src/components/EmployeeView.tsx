'use client';

import { useMemo, useState } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { usePayrollContract } from '@/hooks/usePayrollContract';
import { toast } from 'sonner';

export function EmployeeView() {
  const { address } = useAccount();
  const { employeeStreams, claimSalary, getStream, getClaimableAmount } = usePayrollContract();
  const [employeeIdInput, setEmployeeIdInput] = useState('');

  const streamIds: bigint[] = useMemo(() => {
    if (!employeeStreams) return [];
    try {
      return employeeStreams as unknown as bigint[];
    } catch {
      return [];
    }
  }, [employeeStreams]);

  // Get stream data for each stream ID using useReadContracts
  const streamData = useReadContracts({
    allowFailure: true,
    contracts: streamIds.map(id => getStream(id)),
    query: { enabled: streamIds.length > 0 },
  });
  
  const claimableData = useReadContracts({
    allowFailure: true,
    contracts: employeeIdInput && streamIds.length > 0 
      ? streamIds.map(id => getClaimableAmount(BigInt(employeeIdInput), id))
      : [],
    query: { enabled: !!employeeIdInput && streamIds.length > 0 },
  });

  // Debug logging (only on client side, after variables are declared)
  if (typeof window !== 'undefined') {
    console.log('EmployeeView - address:', address);
    console.log('EmployeeView - employeeStreams:', employeeStreams);
    console.log('EmployeeView - streamData:', streamData.data);
    console.log('EmployeeView - claimableData:', claimableData.data);
  }

  const loading = streamData.isLoading || claimableData.isLoading;

  const displayStreams = useMemo(() => {
    return streamIds.map((id, idx) => {
      const streamResult = streamData.data?.[idx];
      const claimableResult = claimableData.data?.[idx];
      
      const stream = streamResult && 'result' in streamResult 
        ? streamResult.result as [bigint, bigint, bigint, bigint, boolean, `0x${string}`, `0x${string}`]
        : undefined;
      const claimable = claimableResult && 'result' in claimableResult 
        ? claimableResult.result as bigint
        : BigInt(0);
      
      return {
        id: Number(id),
        employer: stream ? stream[6] : '—',
        token: stream ? stream[5] : '—',
        salaryPerSecond: stream ? (Number(stream[1]) / 1e6).toFixed(6) : '—', // Convert from wei to USDC
        totalEarned: stream ? (Number(stream[0]) / 1e6).toFixed(6) : '—', // Convert from wei to USDC
        claimable,
        startTime: stream ? Number(stream[2]) : 0,
        endTime: stream ? Number(stream[3]) : 0,
        isActive: stream ? stream[4] : false,
      };
    });
  }, [streamIds, streamData.data, claimableData.data]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Salary Streams</h2>
        <div className="flex items-center gap-3">
          <input
            value={employeeIdInput}
            onChange={(e) => setEmployeeIdInput(e.target.value.replace(/\D/g, ''))}
            placeholder="Employee ID"
            className="px-3 py-2 rounded-lg text-sm w-36 border border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Refresh
          </button>
          <button
            disabled={!employeeIdInput || displayStreams.length === 0}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40"
            onClick={async () => {
              if (!employeeIdInput) return;
              for (const s of displayStreams) {
                try {
                  toast.loading(`Claiming stream #${s.id}...`, { id: `claim-${s.id}` });
                  await claimSalary(BigInt(employeeIdInput), BigInt(s.id));
                  toast.success(`Claimed stream #${s.id}`, { id: `claim-${s.id}` });
                } catch (err: unknown) {
                  const error = err as { shortMessage?: string; message?: string };
                  toast.error(error?.shortMessage || error?.message || `Failed to claim #${s.id}`, { id: `claim-${s.id}` });
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
          <p className="text-black dark:text-gray-600">Fetching your salary streams...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {displayStreams.map((stream) => (
            <div key={stream.id} className="rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Stream #{stream.id}</h3>
                  <p className="text-black dark:text-gray-600">Employer: {stream.employer}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${stream.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                  {stream.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-black dark:text-gray-600">Token</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{stream.token}</p>
                </div>
                <div>
                  <p className="text-sm text-black dark:text-gray-600">Salary/Second</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{stream.salaryPerSecond} {stream.token}</p>
                </div>
                <div>
                  <p className="text-sm text-black dark:text-gray-600">Total Earned</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{stream.totalEarned} {stream.token}</p>
                </div>
                <div>
                  <p className="text-sm text-black dark:text-gray-600">Claimable</p>
                  <p className="font-semibold text-green-600">{typeof stream.claimable === 'bigint' ? (Number(stream.claimable) / 1e6).toFixed(6) : stream.claimable} USDC</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-black dark:text-gray-600">
                  <p>Employee ID: {employeeIdInput || '—'}</p>
                  <p>Period: {stream.startTime ? new Date(stream.startTime * 1000).toLocaleString() : '—'} to {stream.endTime ? new Date(stream.endTime * 1000).toLocaleString() : '—'}</p>
                </div>
                <button
                  disabled={!employeeIdInput || !stream.isActive}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white/60 dark:focus:ring-offset-black/40 shadow-lg font-medium"
                  onClick={async () => {
                    if (!employeeIdInput) return;
                    try {
                      toast.loading(`Claiming stream #${stream.id}...`, { id: `claim-${stream.id}` });
                      await claimSalary(BigInt(employeeIdInput), BigInt(stream.id));
                      toast.success(`Claimed stream #${stream.id}`, { id: `claim-${stream.id}` });
                    } catch (err: unknown) {
                      const error = err as { shortMessage?: string; message?: string };
                      toast.error(error?.shortMessage || error?.message || `Failed to claim #${stream.id}`, { id: `claim-${stream.id}` });
                    }
                  }}
                >
                  Claim {typeof stream.claimable === 'bigint' ? (Number(stream.claimable) / 1e6).toFixed(6) : stream.claimable} USDC
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
          <p className="text-black dark:text-gray-600">You don&apos;t have any active salary streams yet.</p>
        </div>
      )}
    </div>
  );
}
