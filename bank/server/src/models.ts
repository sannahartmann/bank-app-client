import { dbPromise, Account as AccountType, Transaction as TransactionType } from './db';

export const Account = {
  getAll: async (): Promise<AccountType[]> => {
    const db = await dbPromise;
    return db.all<AccountType[]>("SELECT * FROM accounts");
  },
  updateBalance: async (id: number, amount: number): Promise<number> => {
    const db = await dbPromise;
    const result = await db.run("UPDATE accounts SET availableCash = availableCash + ? WHERE id = ?", [amount, id]);
    return result.changes || 0;
  }
};

export const Transaction = {
  create: async (sourceAccountId: number, destinationAccountId: number, amount: number): Promise<number> => {
    const db = await dbPromise;
    const now = Date.now();
    const result = await db.run(
      "INSERT INTO transactions (registeredTime, executedTime, success, cashAmount, sourceAccountId, destinationAccountId) VALUES (?, ?, ?, ?, ?, ?)",
      [now, now, 1, amount, sourceAccountId, destinationAccountId]
    );
    return result.lastID || 0;
  },
  getById: async (id: number): Promise<TransactionType | undefined> => {
    const db = await dbPromise;
    return db.get<TransactionType>("SELECT * FROM transactions WHERE id = ?", [id]);
  }
};