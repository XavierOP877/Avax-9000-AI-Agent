import { ethers } from "ethers";
import axios from "axios";
import { CHAINLINK_AVAX_USD, CHAINLINK_PRICE_FEED_ABI, ROUTESCAN_API_URL, USDC_ADDRESS, TRADERJOE_ROUTER } from "./constants";
import { SwapParams, Transaction } from "./types";

export const getAVAXPrice = async (provider: ethers.Provider): Promise<number> => {
  const priceFeed = new ethers.Contract(
    CHAINLINK_AVAX_USD,
    CHAINLINK_PRICE_FEED_ABI,
    provider
  );
  
  try {
    const [, answer] = await priceFeed.latestRoundData();
    return Number(ethers.formatUnits(answer, 8));
  } catch (error) {
    console.error("Error fetching AVAX price:", error);
    throw error;
  }
};

export const getAmountOutMin = async (
  provider: ethers.Provider,
  amountIn: bigint,
  path: string[]
): Promise<bigint> => {
  const routerInterface = new ethers.Interface([
    "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)",
  ]);

  const contract = new ethers.Contract(
    TRADERJOE_ROUTER,
    routerInterface,
    provider
  );

  try {
    const amounts = await contract.getAmountsOut(amountIn, path);
    return (amounts[1] * BigInt(99)) / BigInt(100);
  } catch (error) {
    console.error("Error getting amounts out:", error);
    return BigInt(0);
  }
};

export const generateSwapExactAVAXForTokensData = (params: SwapParams): string => {
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

export const fetchBalances = async (wallet: ethers.Wallet): Promise<string> => {
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

export const fetchTransactionHistory = async (wallet: ethers.Wallet): Promise<string> => {
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

    let transactions: Transaction[] = [];

    if (txResponse.data.result && Array.isArray(txResponse.data.result)) {
      transactions = txResponse.data.result.map((tx: Transaction) => ({
        ...tx,
        type: tx.to?.toLowerCase() === TRADERJOE_ROUTER.toLowerCase() ? "Swap" : "Transfer",
        token: "AVAX",
      }));
    }

    if (tokenResponse.data.result && Array.isArray(tokenResponse.data.result)) {
      const tokenTxs = tokenResponse.data.result.map((tx: Transaction) => ({
        ...tx,
        type: "Token Transfer",
        token: "USDC"
      }));
      transactions = [...transactions, ...tokenTxs]
        .sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp))
        .slice(0, 10);
    }

    if (transactions.length === 0) {
      return "No recent transactions found";
    }

    return transactions
      .map((tx: Transaction) => {
        const timestamp = new Date(parseInt(tx.timeStamp) * 1000).toLocaleString();
        const value = tx.token === "AVAX"
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
      })
      .join("\n-------------------\n");
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw new Error("Failed to fetch transaction history");
  }
};