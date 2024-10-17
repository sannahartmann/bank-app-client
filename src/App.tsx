import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Account {
  id: number;
  name: string;
  availableCash: number;
}

interface Transaction {
  id: number;
  sourceAccountId: number;
  destinationAccountId: number;
  amount: number;
}

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sourceAccount, setSourceAccount] = useState<string>('');
  const [destinationAccount, setDestinationAccount] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get<Account[]>('http://localhost:3001/api/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setMessage('Error fetching accounts. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<Transaction>('http://localhost:3001/api/transactions', {
        sourceAccountId: parseInt(sourceAccount),
        destinationAccountId: parseInt(destinationAccount),
        amount: parseFloat(amount)
      });
      setMessage(`Transaction successful! ID: ${response.data.id}`);
      fetchAccounts();
    } catch (error) {
      setMessage(`Error: ${axios.isAxiosError(error) && error.response?.data.error || 'Unknown error occurred'}`);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Bank Transactions</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        {['sourceAccount', 'destinationAccount'].map((accountType) => (
          <div key={accountType} className="mb-4">
            <label htmlFor={accountType} className="block mb-2">
              {accountType === 'sourceAccount' ? 'From' : 'To'} Account:
            </label>
            <select
              id={accountType}
              value={accountType === 'sourceAccount' ? sourceAccount : destinationAccount}
              onChange={(e) => accountType === 'sourceAccount' ? setSourceAccount(e.target.value) : setDestinationAccount(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} (${account.availableCash.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="mb-4">
          <label htmlFor="amount" className="block mb-2">Amount:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Transfer
        </button>
      </form>
      {message && <p className="mb-4 text-red-500">{message}</p>}
      <div>
        <h2 className="text-2xl font-bold mb-2">Available Accounts:</h2>
        <ul>
          {accounts.map(account => (
            <li key={account.id} className="mb-2">
              {account.name}: ${account.availableCash.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}