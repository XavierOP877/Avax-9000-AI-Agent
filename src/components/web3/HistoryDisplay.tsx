import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoryItem, PendingSwap } from './types';

interface HistoryDisplayProps {
  history: HistoryItem[];
  pendingSwaps: PendingSwap[];
  setPendingSwaps: React.Dispatch<React.SetStateAction<PendingSwap[]>>;
}

export const HistoryDisplay: React.FC<HistoryDisplayProps> = ({
  history,
  pendingSwaps,
}) => {
  if (history.length === 0 && pendingSwaps.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="ai-container rounded-2xl overflow-hidden"
    >
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-blue-300 flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          <span>Activity</span>
        </h2>
        
        <div className="space-y-4">
          <AnimatePresence>
            {pendingSwaps.map((swap, index) => (
              <motion.div
                key={`swap-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative group"
              >
                <div className="ai-card border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-xl">
                  {/* ...rest of the swap content... */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-white">
                        Conditional Swap Monitor
                      </h3>
                      <p className="text-slate-300 mt-1">
                        Swap {swap.amount} AVAX to USDC
                      </p>
                      <p className="text-slate-300">
                        Will execute when AVAX price is {swap.operator} ${swap.targetPrice}
                      </p>
                      {swap.currentPrice !== undefined && (
                        <p className="text-slate-300">
                          Current Price: ${swap.currentPrice.toFixed(2)}
                        </p>
                      )}
                      <div className="flex items-center mt-2 text-sm text-slate-400">
                        <span className="flex items-center">
                          <span className="relative flex h-3 w-3 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                          </span>
                          Monitoring price...
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Last checked: {new Date(swap.lastChecked).toLocaleString()}
                      </p>
                      {swap.error && (
                        <p className="text-xs text-red-400 mt-2">
                          Error: {swap.error}
                        </p>
                      )}
                    </div>
                    
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {history.map((item, index) => (
              <motion.div
                key={`history-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative group"
              >
                <div className={`ai-card backdrop-blur-xl ${
                  item.type === "info"
                    ? "border border-blue-500/20 bg-blue-500/5"
                    : item.status === "success"
                    ? "border border-green-500/20 bg-green-500/5"
                    : "border border-red-500/20 bg-red-500/5"
                }`}>
                  {/* Content styling */}
                  <p className="font-medium text-blue-100">{item.description}</p>
                  {item.hash && (
                    <a
                      href={`https://testnet.snowtrace.io/tx/${item.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 mt-2 group"
                    >
                      <span>View on Explorer</span>
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                  {item.result && (
                    <div className="mt-3 px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                      <pre className="text-sm font-mono text-blue-100/90 whitespace-pre-wrap">
                        {item.result}
                      </pre>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-3">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};