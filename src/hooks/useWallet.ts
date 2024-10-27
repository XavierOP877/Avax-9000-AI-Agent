import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '@/types/web3';
import { toast } from 'react-hot-toast';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    wallet: null,
    balance: '0',
    connected: false,
    address: '',
  });

  const connectWallet = async (privateKey: string) => {
    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL
      );
      const wallet = new ethers.Wallet(privateKey, provider);
      const balance = await provider.getBalance(wallet.address);

      setWalletState({
        wallet,
        balance: ethers.formatEther(balance),
        connected: true,
        address: wallet.address,
      });

      localStorage.setItem('walletConnected', 'true');
      toast.success('Wallet connected successfully!');
      return true;
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error('Wallet connection failed:', error);
      return false;
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      wallet: null,
      balance: '0',
      connected: false,
      address: '',
    });
    localStorage.removeItem('walletConnected');
    toast.success('Wallet disconnected');
  };

  const updateBalance = useCallback(async () => {
    if (walletState.wallet?.provider && walletState.connected) {
      const balance = await walletState.wallet.provider.getBalance(walletState.address);
      setWalletState(prev => ({
        ...prev,
        balance: ethers.formatEther(balance),
      }));
    }
  }, [walletState.wallet, walletState.connected, walletState.address]);

  useEffect(() => {
    const interval = setInterval(updateBalance, 30000); 
    return () => clearInterval(interval);
  }, [updateBalance]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    updateBalance,
  };
};