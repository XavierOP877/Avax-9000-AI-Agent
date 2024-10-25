interface HeaderProps {
  isConnected?: boolean;
  onDisconnect?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, onDisconnect }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
          9000 Bounty
        </h1>
        {isConnected && (
          <button
            onClick={onDisconnect}
            className="px-6 py-2 bg-red-500 text-white rounded-lg
                     hover:bg-red-600 transition-all duration-300
                     transform hover:scale-105 active:scale-95"
          >
            Disconnect
          </button>
        )}
      </div>
    </header>
  );
};