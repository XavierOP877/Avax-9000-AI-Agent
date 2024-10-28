interface HeaderProps {
  isConnected?: boolean;
  onDisconnect?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, onDisconnect }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">
              <span className="text-blue-400">Avax-9000-AI-Agent</span>
            </h1>
          </div>
          
          {isConnected && (
            <button
              onClick={onDisconnect}
              className="px-4 py-2 bg-red-500 text-white rounded-lg 
                       hover:bg-red-600 active:bg-red-700 
                       transition-all duration-300 
                       transform hover:scale-105 active:scale-95"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};