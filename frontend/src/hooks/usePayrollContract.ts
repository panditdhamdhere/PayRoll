'use client';

import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

// ABI for PayrollStream contract (complete for frontend)
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
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "uint256", "name": "salaryPerSecond", "type": "uint256"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "uint256", "name": "taxRate", "type": "uint256"},
      {"internalType": "address", "name": "taxRecipient", "type": "address"}
    ],
    "name": "addEmployeePublic",
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
  },
  {
    "inputs": [{"internalType": "address", "name": "employer", "type": "address"}],
    "name": "getEmployerStreams",
    "outputs": [{"internalType": "uint256[]", "name": "streamIds", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "employeeId", "type": "uint256"}],
    "name": "employees",
    "outputs": [
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "uint256", "name": "salaryPerSecond", "type": "uint256"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "uint256", "name": "lastClaimed", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "uint256", "name": "taxRate", "type": "uint256"},
      {"internalType": "address", "name": "taxRecipient", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "streamId", "type": "uint256"}],
    "name": "streams",
    "outputs": [
      {"internalType": "uint256", "name": "totalAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "remainingAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "address", "name": "employer", "type": "address"}
    ],
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

  const { data: employerStreams } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
    abi: PAYROLL_ABI,
    functionName: 'getEmployerStreams',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Helper functions that return hook configurations
  const getEmployee = (employeeId: bigint) => ({
    address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
    abi: PAYROLL_ABI,
    functionName: 'employees' as const,
    args: [employeeId] as const,
  });

  const getStream = (streamId: bigint) => ({
    address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
    abi: PAYROLL_ABI,
    functionName: 'streams' as const,
    args: [streamId] as const,
  });

  const getClaimableAmount = (employeeId: bigint, streamId: bigint) => ({
    address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
    abi: PAYROLL_ABI,
    functionName: 'getClaimableAmount' as const,
    args: [employeeId, streamId] as const,
  });

  // Write functions
  const addEmployee = (recipient: `0x${string}`, salaryPerSecond: bigint, startTime: bigint, endTime: bigint, taxRate: bigint, taxRecipient: `0x${string}`) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
      abi: PAYROLL_ABI,
      functionName: 'addEmployeePublic',
      args: [recipient, salaryPerSecond, startTime, endTime, taxRate, taxRecipient],
    });
  };

  const createStream = (employeeId: bigint, token: `0x${string}`, totalAmount: bigint) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
      abi: PAYROLL_ABI,
      functionName: 'createStream',
      args: [employeeId, token, totalAmount],
    });
  };

  const claimSalary = (employeeId: bigint, streamId: bigint) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.PAYROLL_STREAM as `0x${string}`,
      abi: PAYROLL_ABI,
      functionName: 'claimSalary',
      args: [employeeId, streamId],
    });
  };

  return {
    // Read data
    employeeStreams,
    employerStreams,
    
    // Helper functions
    getEmployee,
    getStream,
    getClaimableAmount,
    
    // Write functions
    addEmployee,
    createStream,
    claimSalary,
  };
}