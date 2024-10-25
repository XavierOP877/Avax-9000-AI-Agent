import { useState, useEffect } from 'react';
import { Transaction } from '@/types/web3';

export const useTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    saveTransactions([transaction, ...transactions]);
  };

  const saveTransactions = (txs: Transaction[]) => {
    localStorage.setItem('transactions', JSON.stringify(txs));
  };

  const loadTransactions = () => {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return { transactions, addTransaction };
};