export const EXAMPLE_PROMPTS = [
    "Transfer 0.1 AVAX to 0x...",
    "Swap 1 AVAX for USDC using Trader Joe",
    "Swap 1 AVAX to USDC when AVAX is above 40"
  ];
  
  export const TRADERJOE_ROUTER = "0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901";
  export const USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65";
  export const WAVAX_ADDRESS = "0xd00ae08403B9bbb9124bB305C09058E32C39A48c";
  export const ROUTESCAN_API_URL = "https://api.routescan.io/v2/network/testnet/evm/43113/etherscan/api";
  export const CHAINLINK_AVAX_USD = "0x5498BB86BC934c8D34FDA08E81D444153d0D06aD";
  
  export const CHAINLINK_PRICE_FEED_ABI = [
    "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
  ];