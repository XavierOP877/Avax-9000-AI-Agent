export interface BrianRequestBase {
  input: string;
  prompt: string;
  address: string;
  chainId: string;
}

export interface BrianTransactionRequest extends BrianRequestBase {
  network: string;
  parameters?: {
    slippage?: string;
    [key: string]: string | number | boolean | undefined;  // More specific than 'any'
  };
}

export interface BrianKnowledgeRequest extends BrianRequestBase {
  // If there are no additional fields needed, we can add a discriminator
  type: 'knowledge';
}

export interface Transaction {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
}

export interface BrianResponse {
  success: boolean;
  result?: Transaction[] | string;
  error?: {
    message?: string;
    issues?: Array<{
      code: string;
      expected: string;
      received: string;
      path: string[];
      message: string;
    }>;
  };
}