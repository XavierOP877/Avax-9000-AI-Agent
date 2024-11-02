import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Header } from '../layout/Header';
import { HistoryDisplay } from './HistoryDisplay';
import { PromptInputSection } from './PromptInputSection';
import { HistoryItem, PendingSwap, SwapParams } from './types';
import { 
  getAVAXPrice,
  getAmountOutMin,
  generateSwapExactAVAXForTokensData,
  fetchBalances,
  fetchTransactionHistory 
} from './utils';
import { 
  WAVAX_ADDRESS,
  USDC_ADDRESS,
  TRADERJOE_ROUTER 
} from './constants';

export const Web3Container: React.FC = () => {
  // State declarations remain the same
  const [prompt, setPrompt] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showExamples, setShowExamples] = useState(true);
  const [pendingSwaps, setPendingSwaps] = useState<PendingSwap[]>([]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      pendingSwaps.forEach(swap => clearInterval(swap.checkInterval));
    };
  }, [pendingSwaps]);

  const connectWallet = async (key: string) => {
    try {
      const cleanKey = key.startsWith("0x") ? key.slice(2) : key;
      if (cleanKey.length !== 64) {
        throw new Error("Invalid private key length");
      }
      const formattedKey = `0x${cleanKey}`;
      if (!process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL) {
        throw new Error("RPC URL not configured");
      }

      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL
      );
      const newWallet = new ethers.Wallet(formattedKey, provider);

      setWallet(newWallet);
      setIsConnected(true);
      toast.success("Wallet connected successfully!");
      setPrivateKey("");
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Invalid private key");
    }
  };
  const handleCheckBalance = async () => {
    if (!wallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const toastId = toast.loading("Fetching balances...");
      const balances = await fetchBalances(wallet);
      setHistory(prev => [{
        type: "info",
        description: "Balance Check",
        result: balances,
        timestamp: new Date().toISOString(),
      }, ...prev]);
      toast.success("Balances fetched successfully", { id: toastId });
    } catch (error) {
      console.error("Error fetching balances:", error);
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Failed to fetch balances"}`
      );
    }
  };

  const handleCheckHistory = async () => {
    if (!wallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const toastId = toast.loading("Fetching transaction history...");
      const txHistory = await fetchTransactionHistory(wallet);
      setHistory(prev => [{
        type: "info",
        description: "Transaction History",
        result: txHistory,
        timestamp: new Date().toISOString(),
      }, ...prev]);
      toast.success("Transaction history fetched", { id: toastId });
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Failed to fetch history"}`
      );
    }
  };

  const setupConditionalSwap = async (amount: string, targetPrice: number, operator: 'above' | 'below') => {
    if (!wallet?.provider) return;

    const checkInterval = setInterval(async () => {
      try {
        // Non-null assertion since we've checked above
        const provider = wallet.provider!;
        const currentPrice = await getAVAXPrice(provider);
        
        setPendingSwaps(prevSwaps => 
          prevSwaps.map(swap => 
            swap.amount === amount && swap.targetPrice === targetPrice
              ? {
                  ...swap,
                  currentPrice,
                  lastChecked: new Date().toISOString()
                }
              : swap
          )
        );

        const conditionMet = operator === 'above' 
          ? currentPrice > targetPrice 
          : currentPrice < targetPrice;

        if (conditionMet) {
          const amountIn = ethers.parseEther(amount);
          const amountOutMin = await getAmountOutMin(
            provider,
            amountIn,
            [WAVAX_ADDRESS, USDC_ADDRESS]
          );

          const swapParams: SwapParams = {
            amountIn,
            amountOutMin,
            path: [WAVAX_ADDRESS, USDC_ADDRESS],
            to: wallet.address,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
          };

          const data = generateSwapExactAVAXForTokensData(swapParams);
          const transaction = {
            to: TRADERJOE_ROUTER,
            data,
            value: amountIn,
            gasLimit: ethers.toBigInt("300000"),
          };

          const tx = await wallet.sendTransaction(transaction);
          const receipt = await tx.wait();

          if (receipt) {
            toast.success(`Conditional swap executed! Hash: ${receipt.hash}`);
            setHistory(prev => [...prev, {
              type: "swap",
              hash: receipt.hash,
              description: `Conditional Swap: ${amount} AVAX for USDC (Price: $${currentPrice})`,
              timestamp: new Date().toISOString(),
              status: "success",
            }]);
          }

          clearInterval(checkInterval);
          setPendingSwaps(prev => 
            prev.filter(swap => swap.checkInterval !== checkInterval)
          );
        }
      } catch (error) {
        console.error("Error in conditional swap check:", error);
        setPendingSwaps(prevSwaps => 
          prevSwaps.map(swap => 
            swap.checkInterval === checkInterval
              ? { ...swap, error: error instanceof Error ? error.message : 'Unknown error' }
              : swap
          )
        );
      }
    }, 30000);

    setPendingSwaps(prev => [...prev, {
      amount,
      targetPrice,
      operator,
      checkInterval,
      lastChecked: new Date().toISOString()
    }]);

    toast.success(`Conditional swap set up! Monitoring AVAX price...`);
  };

  const handleExecute = async () => {
    if (!wallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Processing request...");

    try {
      const walletAddress = await wallet.getAddress();
      const provider = wallet.provider!; // Non-null assertion since we checked wallet exists

      const conditionalSwapMatch = prompt.match(
        /swap ([\d.]+) avax (?:to usdc )?when avax is (above|below) ([\d.]+)/i
      );
      
      if (conditionalSwapMatch) {
        const [, amount, operator, price] = conditionalSwapMatch;
        const currentPrice = await getAVAXPrice(provider);
  
        // Add immediate price check before setting up monitoring
        const conditionMet = operator.toLowerCase() === 'above' 
          ? currentPrice > Number(price)
          : currentPrice < Number(price);
  
        if (conditionMet) {
          toast.error(`Cannot set conditional swap: Current AVAX price ($${currentPrice}) is already ${operator} $${price}`, { id: toastId });
          setIsProcessing(false);
          return;
        }
  
        await setupConditionalSwap(amount, Number(price), operator as 'above' | 'below');
        toast.success(`Conditional swap setup complete. Will execute when AVAX price is ${operator} $${price} (Current: $${currentPrice})`, { id: toastId });
        setPrompt("");
        return;
      }

      if (prompt.toLowerCase().includes("balance")) {
        const balances = await fetchBalances(wallet);
        setHistory(prev => [...prev, {
          type: "info",
          description: "Balance Check",
          result: balances,
          timestamp: new Date().toISOString(),
        }]);
        toast.success("Balances fetched successfully", { id: toastId });
        setPrompt("");
        return;
      }

      // Handle transaction history
      if (prompt.toLowerCase().includes("history") || prompt.toLowerCase().includes("transactions")) {
        const txHistory = await fetchTransactionHistory(wallet);
        setHistory(prev => [...prev, {
          type: "info",
          description: "Transaction History",
          result: txHistory,
          timestamp: new Date().toISOString(),
        }]);
        toast.success("Transaction history fetched", { id: toastId });
        setPrompt("");
        return;
      }

      // Handle transfers
      const transferMatch = prompt.match(
        /(transfer|send) ([\d.]+) avax to (0x[a-fA-F0-9]{40})/i
      );

      if (transferMatch) {
        const [, action, amount, toAddress] = transferMatch;
        const transaction = {
          to: toAddress,
          value: ethers.parseEther(amount),
          gasLimit: ethers.toBigInt("21000"),
        };

        const tx = await wallet.sendTransaction(transaction);
        const receipt = await tx.wait();
        
        if (receipt) {
          toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} confirmed! Hash: ${receipt.hash}`, {
            id: toastId,
          });
          setHistory((prev) => [
            ...prev,
            {
              type: "transfer",
              hash: receipt.hash,
              description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${amount} AVAX to ${toAddress}`,
              timestamp: new Date().toISOString(),
              status: "success",
            },
          ]);
          setPrompt("");
          return;
        }
      }
      // Handle regular swaps
      else if (prompt.toLowerCase().includes("swap")) {
        const match = prompt.match(/^swap ([\d.]+) avax (to|for) usdc(?: using trader joe)?$/i);
        if (match) {
          const [, amount] = match;
          const amountIn = ethers.parseEther(amount);
          const amountOutMin = await getAmountOutMin(
            provider,
            amountIn,
            [WAVAX_ADDRESS, USDC_ADDRESS]
          );

          const swapParams: SwapParams = {
            amountIn,
            amountOutMin,
            path: [WAVAX_ADDRESS, USDC_ADDRESS],
            to: walletAddress,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
          };

          const data = generateSwapExactAVAXForTokensData(swapParams);
          const transaction = {
            to: TRADERJOE_ROUTER,
            data,
            value: amountIn,
            gasLimit: ethers.toBigInt("300000"),
          };

          const tx = await wallet.sendTransaction(transaction);
          const receipt = await tx.wait();
          if (receipt) {
            toast.success(`Swap confirmed! Hash: ${receipt.hash}`, { id: toastId });
            setHistory(prev => [...prev, {
              type: "swap",
              hash: receipt.hash,
              description: `Swap ${amount} AVAX for USDC`,
              timestamp: new Date().toISOString(),
              status: "success",
            }]);
          }
        }
      }

      setPrompt("");
    } catch (error) {
      console.error("Execution error:", error);
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Failed to process request"}`,
        { id: toastId }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Return/render section remains the same
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-95 overflow-hidden">
      {/* Header with new action buttons */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800/50 backdrop-blur-md border-b border-blue-500/20">
        <div className="w-full px-6">
          <Header 
            isConnected={isConnected} 
            onDisconnect={() => {
              setWallet(null);
              setIsConnected(false);
              setHistory([]);
              toast.success("Wallet disconnected");
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }}
            onCheckBalance={handleCheckBalance}
            onCheckHistory={handleCheckHistory}
          />
        </div>
      </div>

      {/* Main Content Area with soft glow */}
      <main className="fixed top-[84px] bottom-[140px] left-0 right-0 overflow-y-auto custom-scrollbar px-6">
        <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-3xl" />
        <motion.div 
          className="relative w-full py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <HistoryDisplay 
            history={history}
            pendingSwaps={pendingSwaps}
            setPendingSwaps={setPendingSwaps}
          />
        </motion.div>
      </main>

      {/* AI-themed Input Section */}
      <div className="fixed bottom-12 left-0 right-0 z-40 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pt-10">
        <div className="w-full px-6">
          <PromptInputSection 
            isConnected={isConnected}
            isProcessing={isProcessing}
            prompt={prompt}
            privateKey={privateKey}
            showExamples={showExamples}
            setPrompt={setPrompt}
            setPrivateKey={setPrivateKey}
            setShowExamples={setShowExamples}
            handleExecute={handleExecute}
            connectWallet={connectWallet}
          />
        </div>
      </div>

      {/* Footer with subtle glow */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-800/50 backdrop-blur-md border-t border-blue-500/20 text-center py-2 text-sm text-blue-200/70 z-30">
        Powered by Avalanche
      </footer>
    </div>
  );
};

export default Web3Container;