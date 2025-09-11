'use client';

import { useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

// ABI for YieldStrategy contract (simplified for frontend)
const YIELD_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "string", "name": "protocol", "type": "string"},
      {"internalType": "uint256", "name": "apy", "type": "uint256"}
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "withdraw",
    "outputs": [
      {"internalType": "uint256", "name": "actualAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "yieldAmount", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}],
    "name": "getTotalYield",
    "outputs": [{"internalType": "uint256", "name": "totalYieldAmount", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}],
    "name": "getCurrentYieldRate",
    "outputs": [{"internalType": "uint256", "name": "yieldRate", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}],
    "name": "getAvailableBalance",
    "outputs": [{"internalType": "uint256", "name": "availableBalance", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function useYieldContract() {
  const { writeContract } = useWriteContract();

  const deposit = (token: `0x${string}`, amount: bigint, protocol: string, apy: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.YIELD_STRATEGY as `0x${string}`,
      abi: YIELD_ABI,
      functionName: 'deposit',
      args: [token, amount, protocol, apy],
    });
  };

  const withdraw = (token: `0x${string}`, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.YIELD_STRATEGY as `0x${string}`,
      abi: YIELD_ABI,
      functionName: 'withdraw',
      args: [token, amount],
    });
  };

  return {
    deposit,
    withdraw,
  };
}