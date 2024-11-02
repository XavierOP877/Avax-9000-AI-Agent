import React from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
  isConnected?: boolean;
  onDisconnect?: () => void;
  onCheckBalance?: () => Promise<void>;
  onCheckHistory?: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({ 
  isConnected, 
  onDisconnect,
  onCheckBalance,
  onCheckHistory
}) => {
  return (
    <nav className="py-4">
      <div className="flex justify-between items-center">
        {/* Logo and Title - Left */}
        <div className="flex items-center space-x-4 w-1/3">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-slow"></div>
            <motion.svg
              className="w-10 h-10 text-blue-500 relative"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M20 5L30 15L20 25L10 15L20 5Z"
                fill="currentColor"
                animate={{ 
                  y: [0, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.path
                d="M10 25L20 35L30 25"
                stroke="currentColor"
                strokeWidth="2"
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  strokeWidth: [2, 3, 2]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.circle
                cx="20"
                cy="20"
                r="15"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  rotate: {
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              />
            </motion.svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient">
                NexusAI
              </span>
            </h1>
            <p className="text-sm text-slate-400">Powered by Avalanche</p>
          </div>
        </div>

        {/* Action Buttons - Center */}
        {isConnected && (
          <div className="flex justify-center items-center space-x-4 w-1/3">
            {/* Balance Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCheckBalance}
              className="px-4 py-2 bg-gradient-to-r from-blue-500/80 to-purple-500/80 
                       text-white rounded-lg border border-blue-400/20
                       hover:shadow-lg hover:shadow-blue-500/25 
                       transition-all duration-300"
            >
              <div className="flex items-center space-x-2">
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Balances</span>
              </div>
            </motion.button>

            {/* History Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCheckHistory}
              className="px-4 py-2 bg-gradient-to-r from-blue-500/80 to-purple-500/80 
                       text-white rounded-lg border border-blue-400/20
                       hover:shadow-lg hover:shadow-blue-500/25 
                       transition-all duration-300"
            >
              <div className="flex items-center space-x-2">
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>History</span>
              </div>
            </motion.button>
          </div>
        )}

        {/* Disconnect Button - Right */}
        <div className="flex justify-end w-1/3">
          {isConnected && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDisconnect}
              className="px-4 py-2 bg-gradient-to-r from-red-500/80 to-pink-500/80 
                       text-white rounded-lg border border-red-400/20
                       hover:shadow-lg hover:shadow-red-500/25 
                       transition-all duration-300"
            >
              Disconnect
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
};