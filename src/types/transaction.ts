export interface BrianTransaction {
    to: string;
    value?: string;
    data?: string;
    gasLimit?: string;
  }
  
  export interface BrianResponse {
    transaction?: BrianTransaction;
    error?: string;
  }