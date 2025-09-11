// Contract addresses - update these after deployment
export const CONTRACT_ADDRESSES = {
  PAYROLL_STREAM: process.env.NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS || '',
  YIELD_STRATEGY: process.env.NEXT_PUBLIC_YIELD_STRATEGY_CONTRACT_ADDRESS || '',
  DAO_DISTRIBUTION: process.env.NEXT_PUBLIC_DAO_DISTRIBUTION_CONTRACT_ADDRESS || '',
};

// Network configuration
export const NETWORK_CONFIG = {
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532'),
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || '',
  BLOCK_EXPLORER: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://sepolia.basescan.org',
};

// Supported tokens
export const SUPPORTED_TOKENS = {
  USDC: {
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin'
  },
  DAI: {
    address: '0x8d9cb8f3191fd685e2c14d2ac3fb2b16d44eafc3',
    symbol: 'DAI',
    decimals: 18,
    name: 'Dai Stablecoin'
  },
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    decimals: 6,
    name: 'Tether USD'
  }
};

// Yield strategies
export const YIELD_STRATEGIES = [
  {
    name: 'Aave V3',
    apy: 8.5,
    description: 'Lend your tokens to earn interest',
    protocol: 'Aave'
  },
  {
    name: 'Compound',
    apy: 6.2,
    description: 'Supply assets to earn interest',
    protocol: 'Compound'
  },
  {
    name: 'Yearn Vaults',
    apy: 12.1,
    description: 'Automated yield farming strategies',
    protocol: 'Yearn'
  }
];
