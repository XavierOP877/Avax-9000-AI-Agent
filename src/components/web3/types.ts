export interface SwapParams {
    amountIn: bigint;
    amountOutMin: bigint;
    path: string[];
    to: string;
    deadline: bigint;
  }
  
  export interface Transaction {
    timeStamp: string;
    type: string;
    value: string;
    from: string;
    to: string;
    isError: string;
    gasUsed: string;
    hash: string;
    token: string;
  }
  
  export interface HistoryItem {
    type: 'info' | 'transfer' | 'swap';
    description: string;
    timestamp: string;
    hash?: string;
    result?: string;
    status?: 'success' | 'failure';
    error?: string;
  }
  
  export interface PendingSwap {
    amount: string;
    targetPrice: number;
    operator: 'above' | 'below';
    checkInterval: NodeJS.Timeout;
    lastChecked: string;
    currentPrice?: number;
    error?: string;
  }