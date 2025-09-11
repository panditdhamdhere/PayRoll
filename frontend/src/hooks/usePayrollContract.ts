'use client';

import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

// ABI for PayrollStream contract (simplified for frontend)
const PAYROLL_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "uint256", "name": "salaryPerSecond", "type": "uint256"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "uint256", "name": "taxRate", "type": "uint256"},
      {"internalType": "address", "name": "taxRecipient", "type": "address"}
    ],
    "name": "addEmployee",
    "outputs": [{"internalType": "uint256", "name": "employeeId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "employeeId", "type": "uint256"},
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "totalAmount", "type": "uint256"}
    ],
    "name": "createStream",
    "outputs": [{"internalType": "uint256", "name": "streamId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "employeeId", "type": "uint256"},
      {"internalType": "uint256", "name": "streamId", "type": "uint256"}
    ],
    "name": "claimSalary",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "employeeId", "type": "uint256"},
      {"internalType": "uint256", "name": "streamId", "type": "uint256"}
    ],
    "name": "getClaimableAmount",
    "outputs": [{"internalType": "uint256", "name": "claimableAmount", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "employee", "type": "address"}],
    "name": "getEmployeeStreams",
    "outputs": [{"internalType": "uint256[]", "name": "streamIds", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function usePayrollContract() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  
  // Read functions
  const { data: employeeStreams } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
    abi: PAYROLL_ABI,
    functionName: 'getEmployeeStreams',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Write functions
  const addEmployee = (args: any[]) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
      abi: PAYROLL_ABI,
      functionName: 'addEmployee',
      args,
    });
  };

  const createStream = (args: any[]) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
      abi: PAYROLL_ABI,
      functionName: 'createStream',
      args,
    });
  };

  const claimSalary = (employeeId: bigint, streamId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
      abi: PAYROLL_ABI,
      functionName: 'claimSalary',
      args: [employeeId, streamId],
    });
  };

  return {
    employeeStreams,
    addEmployee,
    createStream,
    claimSalary,
  };
}