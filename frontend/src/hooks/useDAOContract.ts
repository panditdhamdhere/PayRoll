'use client';

import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

// ABI for DAOTokenDistribution contract (complete for frontend)
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
  },
  {
    "inputs": [{"internalType": "uint256", "name": "allocationId", "type": "uint256"}],
    "name": "tokenAllocations",
    "outputs": [
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "totalAllocation", "type": "uint256"},
      {"internalType": "uint256", "name": "distributedAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "vestingPeriod", "type": "uint256"},
      {"internalType": "uint256", "name": "cliffPeriod", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "employee", "type": "address"},
      {"internalType": "uint256", "name": "allocationId", "type": "uint256"}
    ],
    "name": "employeeAllocations",
    "outputs": [
      {"internalType": "uint256", "name": "allocationId", "type": "uint256"},
      {"internalType": "uint256", "name": "totalAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "claimedAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "vestingEndTime", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
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

  // Helper functions that return hook configurations
  const getTokenAllocation = (allocationId: bigint) => ({
    address: CONTRACT_ADDRESSES.DAO_DISTRIBUTION as `0x${string}`,
    abi: DAO_ABI,
    functionName: 'tokenAllocations' as const,
    args: [allocationId] as const,
  });

  const getEmployeeAllocation = (employee: `0x${string}`, allocationId: bigint) => ({
    address: CONTRACT_ADDRESSES.DAO_DISTRIBUTION as `0x${string}`,
    abi: DAO_ABI,
    functionName: 'employeeAllocations' as const,
    args: [employee, allocationId] as const,
  });

  const getClaimableAmount = (employee: `0x${string}`, allocationId: bigint) => ({
    address: CONTRACT_ADDRESSES.DAO_DISTRIBUTION as `0x${string}`,
    abi: DAO_ABI,
    functionName: 'getClaimableAmount' as const,
    args: [employee, allocationId] as const,
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
    // Read data
    employeeAllocations,
    
    // Helper functions
    getTokenAllocation,
    getEmployeeAllocation,
    getClaimableAmount,
    
    // Write functions
    createTokenAllocation,
    allocateToEmployee,
    claimTokens,
  };
}