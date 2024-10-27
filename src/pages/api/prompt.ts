import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

// Types for Brian API requests and responses
interface BrianTransactionStep {
  to: string;
  data?: string;
  value?: string;
  gasLimit?: string;
  description?: string;
}

interface BrianToken {
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  name: string;
  priceUSD?: string;
}

interface BrianTransactionResponse {
  description?: string;
  fromToken?: BrianToken;
  toToken?: BrianToken;
  fromAmount?: string;
  toAmount?: string;
  steps?: BrianTransactionStep[];
  protocol?: {
    name: string;
    key: string;
  };
}

interface ErrorResponseData {
  error?: {
    message?: string;
    issues?: unknown[];
  };
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API request received:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, senderAddress } = req.body;

    // Handle knowledge/query requests
    if (prompt.toLowerCase().includes('check') || 
        prompt.toLowerCase().includes('show') || 
        prompt.toLowerCase().includes('get') ||
        prompt.toLowerCase().includes('balance')) {
      
      const knowledgeRequest = {
        prompt,
        input: prompt,
        address: senderAddress,
        chainId: "43114" // Avalanche chain ID as string
      };

      console.log('Sending knowledge request:', knowledgeRequest);

      const knowledgeResponse = await axios.post(
        'https://api.brianknows.org/api/v0/agent/knowledge',
        knowledgeRequest,
        {
          headers: {
            'x-brian-api-key': process.env.BRIAN_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Knowledge response:', knowledgeResponse.data);

      return res.status(200).json({ 
        message: knowledgeResponse.data.result?.answer || knowledgeResponse.data.result 
      });
    }

    // Handle transaction requests (swaps, transfers, bridges)
    const transactionType = prompt.toLowerCase().includes('swap') ? 'swap' :
                          prompt.toLowerCase().includes('bridge') ? 'bridge' : 'transfer';

    const transactionRequest = {
      prompt,
      input: prompt,
      address: senderAddress,
      chainId: "43114",
      network: "avalanche-fuji",
      parameters: {
        slippage: "0.5",
        receiver: senderAddress,
        testnet: true
      }
    };

    console.log('Sending transaction request:', transactionRequest);

    const transactionResponse = await axios.post<{ result: BrianTransactionResponse | BrianTransactionResponse[] }>(
      'https://api.brianknows.org/api/v0/agent/transaction',
      transactionRequest,
      {
        headers: {
          'x-brian-api-key': process.env.BRIAN_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Transaction response:', transactionResponse.data);

    // Handle and format the transaction response
    if (transactionResponse.data.result) {
      const rawTransactions = Array.isArray(transactionResponse.data.result) ? 
        transactionResponse.data.result : [transactionResponse.data.result];

      // Format transactions for frontend
      const formattedTransactions = rawTransactions.map((tx: BrianTransactionResponse) => {
        // If transaction has steps, format each step
        if (tx.steps && tx.steps.length > 0) {
          return {
            description: tx.description,
            fromToken: tx.fromToken,
            toToken: tx.toToken,
            fromAmount: tx.fromAmount,
            toAmount: tx.toAmount,
            protocol: tx.protocol,
            steps: tx.steps.map(step => ({
              to: step.to,
              data: step.data,
              value: step.value,
              gasLimit: step.gasLimit || '300000'
            }))
          };
        }

        // For simple transactions without steps
        return {
          description: tx.description || `${transactionType} transaction`,
          steps: [{
            to: tx.steps?.[0]?.to || '',
            data: tx.steps?.[0]?.data || '0x',
            value: tx.steps?.[0]?.value || '0',
            gasLimit: tx.steps?.[0]?.gasLimit || '300000'
          }],
          fromToken: tx.fromToken,
          toToken: tx.toToken,
          fromAmount: tx.fromAmount,
          toAmount: tx.toAmount,
          protocol: tx.protocol
        };
      });

      return res.status(200).json({
        transactions: formattedTransactions,
        type: transactionType
      });
    }

    // If no result, return the raw response
    return res.status(200).json(transactionResponse.data);

  } catch (error) {
    console.error('API Error:', (error as AxiosError<ErrorResponseData>).response?.data || error);

    // Log validation issues if present
    const axiosError = error as AxiosError<ErrorResponseData>;
    if (axiosError.response?.data?.error?.issues) {
      console.log('Validation Issues:', JSON.stringify(axiosError.response.data.error.issues, null, 2));
    }

    // Handle different types of errors
    if (axiosError.response?.status === 400) {
      return res.status(400).json({
        error: 'Invalid request format',
        details: axiosError.response.data?.error
      });
    }

    if (axiosError.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid API key or unauthorized'
      });
    }

    if (axiosError.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.'
      });
    }

    // Default error response
    return res.status(axiosError.response?.status || 500).json({
      error: axiosError.response?.data?.error?.message || 
             axiosError.response?.data?.message ||
             (error as Error).message ||
             'Failed to process request',
      details: axiosError.response?.data
    });
  }
}