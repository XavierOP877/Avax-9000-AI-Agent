import axios, { AxiosError } from 'axios';
import { Transaction } from '../types/brian';  // Import from previous file

export interface BrianApiResponse {
  transaction?: Transaction;
  message?: string;
  error?: string;
}

// Define the structure of the error response
interface ErrorResponse {
  error?: string;
  message?: string;
}

export interface BrianApiError {
  error: string;
  details?: Record<string, unknown>;
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
    
  } catch (error) {
    console.error('Brian API Error:', (error as AxiosError<ErrorResponse>).response?.data || (error as Error).message);
    
    const axiosError = error as AxiosError<ErrorResponse>;
    const errorMessage = 
      axiosError.response?.data?.error || 
      axiosError.response?.data?.message || 
      (error as Error).message || 
      'Failed to process request';
                        
    throw new Error(errorMessage);
  }
};