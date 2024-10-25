'use client';

import { PromptInput } from '@/components/web3/PromptInput';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">9000 Bounty</h1>
        <PromptInput />
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}