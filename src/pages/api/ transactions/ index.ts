import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { hash } = req.body;
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL);
    const receipt = await provider.getTransactionReceipt(hash);

    res.status(200).json(receipt);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching transaction',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}