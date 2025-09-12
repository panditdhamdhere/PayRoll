'use client';

import { useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

// ABI for YieldStrategy contract (complete for frontend)
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
  },
  {
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}],
    "name": "totalDeposits",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}],
    "name": "totalWithdrawals",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}],
    "name": "totalYield",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}],
    "name": "supportedTokens",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function useYieldContract() {
  const { writeContract } = useWriteContract();

  // Helper functions that return hook configurations
  const getTotalDeposits = (token: `0x${string}`) => ({
    address: CONTRACT_ADDRESSES.YIELD_STRATEGY as `0x${string}`,
    abi: YIELD_ABI,
    functionName: 'totalDeposits' as const,
    args: [token] as const,
  });

  const getTotalWithdrawals = (token: `0x${string}`) => ({
    address: CONTRACT_ADDRESSES.YIELD_STRATEGY as `0x${string}`,
    abi: YIELD_ABI,
    functionName: 'totalWithdrawals' as const,
    args: [token] as const,
  });

  const getTotalYield = (token: `0x${string}`) => ({
    address: CONTRACT_ADDRESSES.YIELD_STRATEGY as `0x${string}`,
    abi: YIELD_ABI,
    functionName: 'totalYield' as const,
    args: [token] as const,
  });

  const getAvailableBalance = (token: `0x${string}`) => ({
    address: CONTRACT_ADDRESSES.YIELD_STRATEGY as `0x${string}`,
    abi: YIELD_ABI,
    functionName: 'getAvailableBalance' as const,
    args: [token] as const,
  });

  const getCurrentYieldRate = (token: `0x${string}`) => ({
    address: CONTRACT_ADDRESSES.YIELD_STRATEGY as `0x${string}`,
    abi: YIELD_ABI,
    functionName: 'getCurrentYieldRate' as const,
    args: [token] as const,
  });

  const isTokenSupported = (token: `0x${string}`) => ({
    address: CONTRACT_ADDRESSES.YIELD_STRATEGY as `0x${string}`,
    abi: YIELD_ABI,
    functionName: 'supportedTokens' as const,
    args: [token] as const,
  });

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
    // Helper functions
    getTotalDeposits,
    getTotalWithdrawals,
    getTotalYield,
    getAvailableBalance,
    getCurrentYieldRate,
    isTokenSupported,
    
    // Write functions
    deposit,
    withdraw,
  };
}