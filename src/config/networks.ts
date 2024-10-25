import { NetworkConfig } from '@/types/web3';

export const NETWORKS: { [chainId: number]: NetworkConfig } = {
  43114: {
    chainId: 43114,
    name: 'Avalanche Fuji',
    currency: 'AVAX',
    rpcUrl: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL!,
    blockExplorer: 'https://testnet.snowtrace.io/',
  },
};