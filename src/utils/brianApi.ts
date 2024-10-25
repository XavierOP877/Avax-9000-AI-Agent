import axios from 'axios';

export interface BrianApiResponse {
  transaction?: {
    to: string;
    value?: string;
    data?: string;
    gasLimit?: string;
  };
  message?: string;
  error?: string;
}

export interface BrianApiError {
  error: string;
  details?: any;
}

export const processBrianPrompt = async (prompt: string): Promise<BrianApiResponse> => {
  try {
    const response = await axios.post<BrianApiResponse>('/api/prompt', 
      { 
        prompt,
        chainId: 43114, // Avalanche C-Chain
        slippage: 0.5 // 0.5% slippage tolerance
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('Brian API Response:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('Brian API Error:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to process request';
                        
    throw new Error(errorMessage);
  }
};