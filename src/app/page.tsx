'use client';

import { PromptInput } from '@/components/web3/PromptInput';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <PromptInput />
      <Toaster position="top-right" />
    </div>
  );
}