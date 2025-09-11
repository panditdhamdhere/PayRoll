import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, baseSepolia, polygon, polygonAmoy, arbitrum, optimism } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Decentralized Payroll Protocol',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains: [mainnet, sepolia, baseSepolia, polygon, polygonAmoy, arbitrum, optimism],
  ssr: true,
});
