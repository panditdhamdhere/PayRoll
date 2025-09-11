'use client';

import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

// ABI for DAOTokenDistribution contract (simplified for frontend)
const DAO_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "totalAllocation", "type": "uint256"},
      {"internalType": "uint256", "name": "vestingPeriod", "type": "uint256"},
      {"internalType": "uint256", "name": "cliffPeriod", "type": "uint256"}
    ],
    "name": "createTokenAllocation",
    "outputs": [{"internalType": "uint256", "name": "allocationId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "employee", "type": "address"},
      {"internalType": "uint256", "name": "allocationId", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"}
    ],
    "name": "allocateToEmployee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "allocationId", "type": "uint256"}],
    "name": "claimTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "employee", "type": "address"},
      {"internalType": "uint256", "name": "allocationId", "type": "uint256"}
    ],
    "name": "getClaimableAmount",
    "outputs": [{"internalType": "uint256", "name": "claimableAmount", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "employee", "type": "address"}],
    "name": "getEmployeeAllocations",
    "outputs": [{"internalType": "uint256[]", "name": "allocationIds", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function useDAOContract() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  
  const { data: employeeAllocations } = useReadContract({
    address: CONTRACT_ADDRESSES.DAO_DISTRIBUTION as `0x${string}`,
    abi: DAO_ABI,
    functionName: 'getEmployeeAllocations',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const createTokenAllocation = (token: `0x${string}`, totalAllocation: bigint, vestingPeriod: bigint, cliffPeriod: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.DAO_DISTRIBUTION as `0x${string}`,
      abi: DAO_ABI,
      functionName: 'createTokenAllocation',
      args: [token, totalAllocation, vestingPeriod, cliffPeriod],
    });
  };

  const allocateToEmployee = (employee: `0x${string}`, allocationId: bigint, amount: bigint, startTime: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.DAO_DISTRIBUTION as `0x${string}`,
      abi: DAO_ABI,
      functionName: 'allocateToEmployee',
      args: [employee, allocationId, amount, startTime],
    });
  };

  const claimTokens = (allocationId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.DAO_DISTRIBUTION as `0x${string}`,
      abi: DAO_ABI,
      functionName: 'claimTokens',
      args: [allocationId],
    });
  };

  return {
    employeeAllocations,
    createTokenAllocation,
    allocateToEmployee,
    claimTokens,
  };
}