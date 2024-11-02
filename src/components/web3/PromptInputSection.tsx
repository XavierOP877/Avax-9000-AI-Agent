import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXAMPLE_PROMPTS } from './constants';

interface PromptInputSectionProps {
  isConnected: boolean;
  isProcessing: boolean;
  prompt: string;
  privateKey: string;
  showExamples: boolean;
  setPrompt: (prompt: string) => void;
  setPrivateKey: (key: string) => void;
  setShowExamples: (show: boolean) => void;
  handleExecute: () => void;
  connectWallet: (key: string) => void;
}

export const PromptInputSection: React.FC<PromptInputSectionProps> = ({
  isConnected,
  isProcessing,
  prompt,
  privateKey,
  showExamples,
  setPrompt,
  setPrivateKey,
  setShowExamples,
  handleExecute,
  connectWallet,
}) => {
  const handlePromptSelect = (example: string) => {
    setPrompt(example);
    setShowExamples(false);
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-20">
      <div className="bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-12">
        <div className={`mx-auto px-4 transition-all duration-300 ${showExamples ? 'max-w-4xl' : 'max-w-2xl'}`}>
          <div className="gradient-border p-6 shadow-2xl">
            <AnimatePresence mode="wait">
              {!isConnected ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient">
                    Connect Your Wallet
                  </h2>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <input
                      type="password"
                      placeholder="Enter your private key"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      className="relative w-full px-6 py-4 bg-slate-800/50 text-white rounded-xl border border-slate-700 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
                               placeholder-slate-400"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => connectWallet(privateKey)}
                    className="relative w-full group overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
                             text-white rounded-xl font-medium text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/50
                             transition-all duration-300"
                  >
                    <span className="relative z-10">Connect Wallet</span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    </div>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1 group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                      <input
                        value={prompt}
                        onChange={(e) => {
                          setPrompt(e.target.value);
                          if (e.target.value === '') {
                            setShowExamples(true);
                          }
                        }}
                        placeholder="What would you like to do?"
                        className="relative w-full px-6 py-4 bg-slate-800/50 text-white rounded-full border border-slate-700
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
                                 placeholder-slate-400"
                        disabled={isProcessing}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExecute}
                      disabled={isProcessing}
                      className="relative group h-14 w-14 flex items-center justify-center rounded-full 
                               bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                               shadow-lg shadow-blue-500/25 hover:shadow-blue-500/50
                               transition-all duration-300"
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                      ) : (
                        <motion.svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <path d="m12 19V5" />
                          <path d="m5 12 7-7 7 7" />
                        </motion.svg>
                      )}
                      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-shimmer"></div>
                      </div>
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {showExamples && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4"
                      >
                        <p className="text-slate-400 mb-2 font-medium">Example prompts:</p>
                        <div className="flex flex-wrap gap-2">
                          {EXAMPLE_PROMPTS.map((example, index) => (
                            <motion.button
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePromptSelect(example)}
                              className="px-4 py-2 rounded-full text-sm
                                       bg-gradient-to-r from-blue-500/10 to-purple-500/10
                                       border border-blue-500/20 hover:border-blue-500/40
                                       text-blue-400 hover:text-blue-300
                                       transition-all duration-300"
                            >
                              {example}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};