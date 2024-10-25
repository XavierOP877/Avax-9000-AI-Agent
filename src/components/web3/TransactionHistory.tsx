import { useTransactionHistory } from '@/hooks/useTransactionHistory';

export const TransactionHistory = () => {
  const { transactions } = useTransactionHistory();

  if (transactions.length === 0) return null;

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
      <div className="space-y-4">
        {transactions.map((tx, index) => (
          <div
            key={index}
            className={`p-4 rounded ${
              tx.status === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <p className="font-bold">Prompt: {tx.prompt}</p>
            {tx.hash && (
              <a
                href={`https://snowtrace.io/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on Explorer
              </a>
            )}
            <p className="text-sm text-gray-500">
              {new Date(tx.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};