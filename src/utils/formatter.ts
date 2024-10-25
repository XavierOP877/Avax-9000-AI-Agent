import { ethers } from 'ethers';

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatAmount = (amount: string, decimals: number = 18): string => {
  return parseFloat(ethers.formatUnits(amount, decimals)).toFixed(4);
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};