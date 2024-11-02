'use client';

import { Web3Container } from '@/components/web3/Web3Container';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      < Web3Container/>
      <Toaster position="top-right" />
    </div>
  );
}