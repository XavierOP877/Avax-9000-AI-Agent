import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";
import axios from "axios";


// Constants for API endpoints and contract addresses
const EXAMPLE_PROMPTS = [
  "Transfer 0.1 AVAX to 0x...",
  "Swap 1 AVAX for USDC using Trader Joe",
  "Show my balances",
  "Show transaction history",
];

const TRADERJOE_ROUTER = "0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901";
const USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65";
const WAVAX_ADDRESS = "0xd00ae08403B9bbb9124bB305C09058E32C39A48c";
const ROUTESCAN_API_URL =
  "https://api.routescan.io/v2/network/testnet/evm/43113/etherscan/api";

interface SwapParams {
  amountIn: bigint;
  amountOutMin: bigint;
  path: string[];
  to: string;
  deadline: bigint;
}

interface TokenBalance {
  symbol: string;
  balance: string;
  usdValue?: string;
}

interface TransactionInfo {
  hash: string;
  type: string;
  amount: string;
  token: string;
  timestamp: string;
  status: string;
}

export const PromptInput: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Function to connect wallet using private key
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
      const address = await newWallet.getAddress();

      setWallet(newWallet);
      setIsConnected(true);
      toast.success("Wallet connected successfully!");
      setPrivateKey("");
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Invalid private key");
    }
  };

  // Function to fetch wallet balances
  const fetchBalances = async (wallet: ethers.Wallet): Promise<string> => {
    if (!wallet.provider) throw new Error("Provider not connected");

    try {
      const avaxBalance = await wallet.provider.getBalance(wallet.address);
      const formattedAvaxBalance = ethers.formatEther(avaxBalance);

      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        ["function balanceOf(address) view returns (uint256)"],
        wallet.provider
      );
      const usdcBalance = await usdcContract.balanceOf(wallet.address);
      const formattedUsdcBalance = ethers.formatUnits(usdcBalance, 6);

      return `Current Balances:\nAVAX: ${formattedAvaxBalance}\nUSDC: ${formattedUsdcBalance}`;
    } catch (error) {
      console.error("Error fetching balances:", error);
      throw error;
    }
  };

  // Function to fetch transaction history
  const fetchTransactionHistory = async (
    wallet: ethers.Wallet
  ): Promise<string> => {
    if (!wallet.provider) throw new Error("Provider not connected");

    try {
      const [txResponse, tokenResponse] = await Promise.all([
        axios.get(ROUTESCAN_API_URL, {
          params: {
            module: "account",
            action: "txlist",
            address: wallet.address,
            startblock: "0",
            endblock: "99999999",
            page: "1",
            offset: "10",
            sort: "desc",
          },
        }),
        axios.get(ROUTESCAN_API_URL, {
          params: {
            module: "account",
            action: "tokentx",
            address: wallet.address,
            contractaddress: USDC_ADDRESS,
            page: "1",
            offset: "10",
            sort: "desc",
          },
        }),
      ]);

      let transactions = [];

      if (txResponse.data.result && Array.isArray(txResponse.data.result)) {
        transactions = txResponse.data.result.map((tx: any) => ({
          ...tx,
          type:
            tx.to?.toLowerCase() === TRADERJOE_ROUTER.toLowerCase()
              ? "Swap"
              : "Transfer",
          token: "AVAX",
        }));
      }

      if (
        tokenResponse.data.result &&
        Array.isArray(tokenResponse.data.result)
      ) {
        const tokenTxs = tokenResponse.data.result.map((tx: any) => ({
          ...tx,
          type: "Token Transfer",
          token: "USDC",
        }));
        transactions = [...transactions, ...tokenTxs]
          .sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp))
          .slice(0, 10);
      }

      if (transactions.length === 0) {
        return "No recent transactions found";
      }

      return transactions
        .map(
          (tx: {
            timeStamp: string;
            type: string;
            value: string;
            from: string;
            to: string;
            isError: string;
            gasUsed: string;
            hash: string;
            token: string;
          }) => {
            const timestamp = new Date(
              parseInt(tx.timeStamp) * 1000
            ).toLocaleString();
            const value =
              tx.token === "AVAX"
                ? `${ethers.formatEther(tx.value)} AVAX`
                : `${ethers.formatUnits(tx.value, 6)} USDC`;

            return (
              `${timestamp}\n` +
              `Type: ${tx.type}\n` +
              `Amount: ${value}\n` +
              `From: ${tx.from}\n` +
              `To: ${tx.to || "Contract Creation"}\n` +
              `Status: ${tx.isError === "0" ? "Success" : "Failed"}\n` +
              `Gas Used: ${ethers.formatEther(tx.gasUsed || "0")} AVAX\n` +
              `Hash: ${tx.hash}\n`
            );
          }
        )
        .join("\n-------------------\n");
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      throw new Error("Failed to fetch transaction history");
    }
  };

  // Functions for swap operations
  const getAmountOutMin = async (
    amountIn: bigint,
    path: string[]
  ): Promise<bigint> => {
    if (!wallet?.provider) throw new Error("Provider not connected");

    const routerInterface = new ethers.Interface([
      "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)",
    ]);

    const contract = new ethers.Contract(
      TRADERJOE_ROUTER,
      routerInterface,
      wallet.provider
    );

    try {
      const amounts = await contract.getAmountsOut(amountIn, path);
      return (amounts[1] * BigInt(99)) / BigInt(100);
    } catch (error) {
      console.error("Error getting amounts out:", error);
      return BigInt(0);
    }
  };

  const generateSwapExactAVAXForTokensData = (params: SwapParams): string => {
    const routerInterface = new ethers.Interface([
      "function swapExactAVAXForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    ]);

    return routerInterface.encodeFunctionData("swapExactAVAXForTokens", [
      params.amountOutMin,
      params.path,
      params.to,
      params.deadline,
    ]);
  };

  // Main execute function to handle all operations
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

      // Handle balance check
      if (prompt.toLowerCase().includes("balance")) {
        const balances = await fetchBalances(wallet);
        setHistory((prev) => [
          ...prev,
          {
            type: "info",
            description: "Balance Check",
            result: balances,
            timestamp: new Date().toISOString(),
          },
        ]);
        toast.success("Balances fetched successfully", { id: toastId });
        setPrompt("");
        return;
      }

      // Handle transaction history
      if (
        prompt.toLowerCase().includes("history") ||
        prompt.toLowerCase().includes("transactions")
      ) {
        const txHistory = await fetchTransactionHistory(wallet);
        setHistory((prev) => [
          ...prev,
          {
            type: "info",
            description: "Transaction History",
            result: txHistory,
            timestamp: new Date().toISOString(),
          },
        ]);
        toast.success("Transaction history fetched", { id: toastId });
        setPrompt("");
        return;
      }

      // Handle transfers
      if (prompt.toLowerCase().includes("transfer")) {
        const match = prompt.match(
          /transfer ([\d.]+) avax to (0x[a-fA-F0-9]{40})/i
        );
        if (match) {
          const [_, amount, toAddress] = match;
          const transaction = {
            to: toAddress,
            value: ethers.parseEther(amount),
            gasLimit: ethers.toBigInt("21000"),
          };

          const tx = await wallet.sendTransaction(transaction);
          const receipt = await tx.wait();
          if (receipt) {
            toast.success(`Transfer confirmed! Hash: ${receipt.hash}`, {
              id: toastId,
            });
            setHistory((prev) => [
              ...prev,
              {
                type: "transfer",
                hash: receipt.hash,
                description: `Transfer ${amount} AVAX to ${toAddress}`,
                timestamp: new Date().toISOString(),
                status: "success",
              },
            ]);
          }
        }
      }
      // Handle swaps
      else if (prompt.toLowerCase().includes("swap")) {
        const match = prompt.match(/swap ([\d.]+) avax/i);
        if (match) {
          const [_, amount] = match;
          const amountIn = ethers.parseEther(amount);
          const amountOutMin = await getAmountOutMin(amountIn, [
            WAVAX_ADDRESS,
            USDC_ADDRESS,
          ]);

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
            toast.success(`Swap confirmed! Hash: ${receipt.hash}`, {
              id: toastId,
            });
            setHistory((prev) => [
              ...prev,
              {
                type: "swap",
                hash: receipt.hash,
                description: `Swap ${amount} AVAX for USDC`,
                timestamp: new Date().toISOString(),
                status: "success",
              },
            ]);
          }
        }
      }

      setPrompt("");
    } catch (error) {
      console.error("Execution error:", error);
      toast.error(
        `Error: ${
          error instanceof Error ? error.message : "Failed to process request"
        }`,
        { id: toastId }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-fadeIn">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-8 shadow-xl transition-all hover:shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            9000 Bounty
          </h1>
          {isConnected && (
            <button
              onClick={() => {
                setWallet(null);
                setIsConnected(false);
                toast.success("Wallet disconnected");
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-lg
                       hover:bg-red-600 transition-all duration-300
                       transform hover:scale-105 active:scale-95"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
  
      {/* Transaction History - Moved above the input section */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Results</h2>
          <div className="flex flex-col-reverse space-y-reverse space-y-4">
            {history.map((item, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl transition-all duration-300 hover:shadow-md
                        ${
                          item.type === "info"
                            ? "bg-blue-50 hover:bg-blue-100"
                            : item.status === "success"
                            ? "bg-green-50 hover:bg-green-100"
                            : "bg-red-50 hover:bg-red-100"
                        }`}
              >
                <p className="font-medium text-gray-800">{item.description}</p>
                {item.hash && (
                  <a
                    href={`https://testnet.snowtrace.io/tx/${item.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-500 hover:text-blue-700
                           mt-2 transition-colors duration-300"
                  >
                    <span>View on Explorer</span>
                    <svg
                      className="w-4 h-4"
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
                  <p className="mt-2 text-gray-600 font-mono text-sm whitespace-pre-wrap">
                    {item.result}
                  </p>
                )}
                {item.error && <p className="mt-2 text-red-600">{item.error}</p>}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
  
      {/* Input Section */}
      <div className="bg-white rounded-2xl p-8 shadow-xl transition-all hover:shadow-2xl">
        {!isConnected ? (
          <div className="space-y-6 animate-slideUp">
            <h2 className="text-2xl font-semibold text-gray-800">Connect Wallet</h2>
            <input
              type="password"
              placeholder="Enter your private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl
                     text-gray-800 bg-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-300"
            />
            <button
              onClick={() => connectWallet(privateKey)}
              className="w-full bg-blue-500 text-white py-4 px-6 rounded-xl
                     hover:bg-blue-600 active:bg-blue-700 
                     transition-all duration-300
                     transform hover:scale-105 active:scale-95
                     font-medium text-lg"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-slideUp">
            <h2 className="text-2xl font-semibold text-gray-800">
              What would you like to do?
            </h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
              className="w-full p-4 border border-gray-300 rounded-xl
                     text-gray-800 bg-white min-h-[120px]
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-300 resize-none"
              disabled={isProcessing}
            />
  
            {/* Example Prompts */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Example prompts:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="text-left text-blue-500 hover:text-blue-700 
                           p-2 rounded-lg hover:bg-blue-50
                           transition-all duration-300"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
  
            <button
              onClick={handleExecute}
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-xl font-medium text-lg
                     transition-all duration-300
                     transform hover:scale-105 active:scale-95
                     ${
                       isProcessing
                         ? "bg-gray-400 cursor-not-allowed"
                         : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
                     }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Execute"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptInput;
