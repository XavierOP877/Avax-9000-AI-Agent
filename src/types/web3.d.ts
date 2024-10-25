import { ethers } from 'ethers';

export interface WalletState {
  wallet: ethers.Wallet | null;
  balance: string;
  connected: boolean;
  address: string;
}

export interface Transaction {
  hash: string;
  timestamp: string;
  prompt: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  currency: string;
  rpcUrl: string;
  blockExplorer: string;
}