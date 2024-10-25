import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'react-hot-toast';

export const WalletConnect = () => {
  const [privateKey, setPrivateKey] = useState('');
  const { connectWallet, disconnectWallet, connected, address, balance } = useWallet();

  const handleConnect = async () => {
    try {
      if (!privateKey.trim()) {
        toast.error('Please enter a private key');
        return;
      }

      const success = await connectWallet(privateKey);
      if (success) {
        setPrivateKey('');
        toast.success('Wallet connected successfully!');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.success('Wallet disconnected');
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Wallet Connection</h2>
      {!connected ? (
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Enter your private key"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="w-full p-3 rounded-md text-gray-800"
          />
          <button
            onClick={handleConnect}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-md
                     hover:bg-blue-600 transition-colors duration-200"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-800">Address: {address}</p>
          <p className="text-gray-800">Balance: {balance} AVAX</p>
          <button
            onClick={handleDisconnect}
            className="w-full py-3 px-4 bg-red-500 text-white rounded-md
                     hover:bg-red-600 transition-colors duration-200"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};